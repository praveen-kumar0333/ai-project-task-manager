const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const AppError = require('../utils/appError');
const { chunkText } = require('../utils/textChunker');
const { generateEmbedding } = require('./embeddingService');
const { PDFParse } = require('pdf-parse');

/**
 * Safely extracts raw text from a document file based on MIME type or extension.
 *
 * @param {string} filePath - Path to file on disk
 * @param {string} mimeType - MIME type of file
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} Cleaned extracted text
 */
async function extractTextFromFile(filePath, mimeType, originalName) {
  if (!fs.existsSync(filePath)) {
    throw new AppError('Document file not found on server', 404);
  }

  const isPdf = (mimeType && mimeType.includes('pdf')) || (originalName && originalName.toLowerCase().endsWith('.pdf'));
  const isTxt = (mimeType && (mimeType.includes('text') || mimeType.includes('plain'))) || (originalName && originalName.toLowerCase().endsWith('.txt'));

  if (!isPdf && !isTxt) {
    throw new AppError('Unsupported document format. Only PDF and TXT documents are supported.', 415);
  }

  let rawText = '';

  if (isTxt) {
    try {
      rawText = await fs.promises.readFile(filePath, 'utf8');
    } catch (readError) {
      console.error('Failed to read TXT file:', readError);
      throw new AppError('Failed to read uploaded text document', 400);
    }
  } else if (isPdf) {
    let parser = null;
    try {
      const buffer = await fs.promises.readFile(filePath);
      if (!buffer || buffer.length === 0) {
        throw new AppError('The uploaded PDF file is empty', 400);
      }

      parser = new PDFParse({ data: buffer });
      const parseResult = await parser.getText();
      rawText = parseResult?.text || '';
    } catch (pdfError) {
      if (pdfError instanceof AppError) throw pdfError;
      console.error('Failed to parse PDF document:', pdfError?.message || pdfError);
      throw new AppError('Failed to parse PDF file. The file may be corrupt, password-protected, or contain scanned images without text.', 400);
    } finally {
      if (parser && typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  const cleaned = (rawText || '').trim();
  if (cleaned.length < 5) {
    throw new AppError('The uploaded document does not contain readable text content.', 400);
  }

  return cleaned;
}

/**
 * Ingests, processes, chunks, embeds, and stores a document for the authenticated user.
 *
 * @param {object} params
 * @param {number} params.userId - Authenticated user ID
 * @param {string} params.originalName - Uploaded file's original name
 * @param {string} params.mimeType - File MIME type
 * @param {number} params.fileSize - File size in bytes
 * @param {string} params.filePath - Server path to file
 * @returns {Promise<object>} Created document record
 */
async function processAndStoreDocument({ userId, originalName, mimeType, fileSize, filePath }) {
  // 1. Extract text
  const extractedText = await extractTextFromFile(filePath, mimeType, originalName);

  // 2. Chunk text
  const chunks = chunkText(extractedText);
  if (chunks.length === 0) {
    throw new AppError('Could not segment the document into readable chunks', 400);
  }

  // 3. Database transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Insert document record
    const docQuery = `
      INSERT INTO documents (user_id, name, original_name, file_path, mime_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [docResult] = await connection.execute(docQuery, [
      userId,
      originalName,
      originalName,
      filePath,
      mimeType,
      fileSize
    ]);

    const documentId = docResult.insertId;

    // 4. Generate embeddings and insert chunks
    const chunkInsertQuery = `
      INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
      VALUES (?, ?, ?, ?)
    `;

    for (let index = 0; index < chunks.length; index++) {
      const chunkContent = chunks[index];
      const embeddingVector = await generateEmbedding(chunkContent);
      const serializedVector = JSON.stringify(embeddingVector);

      await connection.execute(chunkInsertQuery, [
        documentId,
        index,
        chunkContent,
        serializedVector
      ]);
    }

    await connection.commit();

    return {
      id: documentId,
      userId,
      name: originalName,
      originalName,
      mimeType,
      fileSize,
      chunkCount: chunks.length,
      createdAt: new Date().toISOString()
    };
  } catch (dbError) {
    await connection.rollback();
    // Clean up uploaded file on failure
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // Ignore file cleanup error
      }
    }
    console.error('Failed to store document in database:', dbError?.message || dbError);
    throw new AppError('Failed to process and store document. Please try again later.', 500);
  } finally {
    connection.release();
  }
}

/**
 * Retrieves all documents owned by the authenticated user.
 *
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<Array<object>>} List of user documents
 */
async function getUserDocuments(userId) {
  const query = `
    SELECT 
      d.id,
      d.user_id as userId,
      d.name,
      d.original_name as originalName,
      d.mime_type as mimeType,
      d.file_size as fileSize,
      d.created_at as createdAt,
      COUNT(c.id) as chunkCount
    FROM documents d
    LEFT JOIN document_chunks c ON d.id = c.document_id
    WHERE d.user_id = ?
    GROUP BY d.id
    ORDER BY d.id DESC
  `;

  const [rows] = await pool.execute(query, [userId]);
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    originalName: r.originalName,
    mimeType: r.mimeType,
    fileSize: r.fileSize,
    chunkCount: Number(r.chunkCount) || 0,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString()
  }));
}

/**
 * Deletes a document and its chunks, verifying user ownership.
 *
 * @param {number} documentId - Document ID to delete
 * @param {number} userId - Authenticated user ID
 * @returns {Promise<boolean>} True if deleted
 */
async function deleteUserDocument(documentId, userId) {
  // 1. Verify existence and ownership
  const [rows] = await pool.execute(
    'SELECT id, file_path FROM documents WHERE id = ? AND user_id = ?',
    [documentId, userId]
  );

  if (rows.length === 0) {
    throw new AppError('Document not found or you do not have permission to delete it', 404);
  }

  const document = rows[0];

  // 2. Delete from database (foreign keys automatically cascade delete document_chunks)
  await pool.execute('DELETE FROM documents WHERE id = ? AND user_id = ?', [documentId, userId]);

  // 3. Remove physical file from disk safely
  if (document.file_path && fs.existsSync(document.file_path)) {
    try {
      await fs.promises.unlink(document.file_path);
    } catch (unlinkErr) {
      console.warn('Could not remove file on disk:', unlinkErr?.message);
    }
  }

  return true;
}

module.exports = {
  extractTextFromFile,
  processAndStoreDocument,
  getUserDocuments,
  deleteUserDocument
};
