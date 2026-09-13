const documentService = require('../services/documentService');
const AppError = require('../utils/appError');

/**
 * POST /api/documents/upload
 * Uploads, extracts text, chunks, embeds, and stores a document.
 */
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError('No document file uploaded. Please select a PDF or TXT file.', 400));
    }

    const userId = req.user.id;
    const { originalname, mimetype, size, path: filePath } = req.file;

    const document = await documentService.processAndStoreDocument({
      userId,
      originalName: originalname,
      mimeType: mimetype,
      fileSize: size,
      filePath
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and indexed successfully into knowledge base',
      data: document
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/documents
 * Retrieves all documents belonging to the authenticated user.
 */
async function getDocuments(req, res, next) {
  try {
    const userId = req.user.id;
    const documents = await documentService.getUserDocuments(userId);

    res.status(200).json({
      success: true,
      message: 'Documents retrieved successfully',
      data: documents
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id
 * Deletes a document, its chunks, and file on disk with ownership verification.
 */
async function deleteDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const documentId = parseInt(req.params.id, 10);

    if (isNaN(documentId)) {
      return next(new AppError('Invalid document ID provided', 400));
    }

    await documentService.deleteUserDocument(documentId, userId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully from knowledge base'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument
};
