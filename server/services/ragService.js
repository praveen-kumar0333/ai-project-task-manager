const { pool } = require('../config/db');
const { generateEmbedding, cosineSimilarity } = require('./embeddingService');

const DEFAULT_TOP_K = 4;
const DEFAULT_SIMILARITY_THRESHOLD = 0.22; // Semantic relevance threshold

/**
 * Searches the authenticated user's document chunks for content semantically relevant to a query.
 * User isolation is strictly enforced via `JOIN documents ON ... WHERE documents.user_id = ?`.
 *
 * @param {object} params
 * @param {number} params.userId - Authenticated user ID
 * @param {string} params.query - User search query or question
 * @param {number} [params.topK=4] - Max number of top chunks to return
 * @param {number} [params.threshold=0.35] - Minimum cosine similarity threshold
 * @returns {Promise<{ hasContext: boolean, chunks: Array<object>, sources: Array<object> }>}
 */
async function retrieveRelevantContext({ userId, query, topK = DEFAULT_TOP_K, threshold = DEFAULT_SIMILARITY_THRESHOLD }) {
  if (!userId || !query || typeof query !== 'string' || query.trim().length === 0) {
    return { hasContext: false, chunks: [], sources: [] };
  }

  // 1. Generate query embedding
  const queryVector = await generateEmbedding(query.trim());

  // 2. Load all document chunks belonging exclusively to the authenticated user
  const sql = `
    SELECT 
      c.id,
      c.document_id as documentId,
      c.chunk_index as chunkIndex,
      c.content,
      c.embedding,
      d.name as documentName,
      d.original_name as originalName
    FROM document_chunks c
    INNER JOIN documents d ON c.document_id = d.id
    WHERE d.user_id = ?
  `;

  const [rows] = await pool.execute(sql, [userId]);

  if (!rows || rows.length === 0) {
    return { hasContext: false, chunks: [], sources: [] };
  }

  // 3. Compute cosine similarity for each chunk
  const scoredChunks = [];

  for (const row of rows) {
    let chunkVector = null;
    if (row.embedding) {
      try {
        chunkVector = typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding;
      } catch (err) {
        console.warn(`[RAG] Failed to parse embedding for chunk ${row.id}:`, err?.message);
      }
    }

    if (!Array.isArray(chunkVector) || chunkVector.length === 0) {
      continue;
    }

    const similarity = cosineSimilarity(queryVector, chunkVector);

    if (similarity >= threshold) {
      scoredChunks.push({
        id: row.id,
        documentId: row.documentId,
        documentName: row.originalName || row.documentName,
        chunkIndex: row.chunkIndex,
        content: row.content,
        similarity
      });
    }
  }

  // 4. Sort by highest similarity first
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  // 5. Select top K chunks
  const selectedChunks = scoredChunks.slice(0, topK);

  if (selectedChunks.length === 0) {
    return { hasContext: false, chunks: [], sources: [] };
  }

  // 6. Deduplicate sources for presentation
  const sourcesMap = new Map();
  selectedChunks.forEach(chunk => {
    if (!sourcesMap.has(chunk.documentId)) {
      sourcesMap.set(chunk.documentId, {
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        chunkIndex: chunk.chunkIndex,
        relevanceScore: Number(chunk.similarity.toFixed(3))
      });
    }
  });

  return {
    hasContext: true,
    chunks: selectedChunks,
    sources: Array.from(sourcesMap.values())
  };
}

/**
 * Formats retrieved chunks into safe, delimited context blocks with prompt injection hardening.
 * Documents are strictly treated as DATA, not system instructions.
 *
 * @param {Array<object>} chunks - Retrieved chunks
 * @returns {string} Formatted context string
 */
function formatGroundedContext(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return '';
  }

  const formattedBlocks = chunks.map((c, i) => {
    // Sanitize any potential prompt injection delimiter mimics
    const cleanContent = (c.content || '').replace(/---/g, '- - -');
    return `[DOCUMENT SOURCE ${i + 1}: ${c.documentName} (chunk #${c.chunkIndex})]
${cleanContent}
[END SOURCE ${i + 1}]`;
  });

  return `\n<RETRIEVED_USER_DOCUMENTS>\n${formattedBlocks.join('\n\n')}\n</RETRIEVED_USER_DOCUMENTS>\n`;
}

module.exports = {
  retrieveRelevantContext,
  formatGroundedContext,
  DEFAULT_TOP_K,
  DEFAULT_SIMILARITY_THRESHOLD
};
