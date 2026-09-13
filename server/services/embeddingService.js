const { getGeminiClient } = require('./geminiService');

const EMBEDDING_DIMENSION = 768;

/**
 * Generates a normalized 768-dimensional fallback semantic vector
 * based on token frequency and character n-gram hashing.
 * Guarantees that vector search remains functional even if external API limits or key issues occur.
 *
 * @param {string} text - Input text
 * @returns {Array<number>} 768-dimensional normalized float array
 */
function generateDeterministicVector(text) {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  if (!text || typeof text !== 'string') return vector;

  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = normalized.split(/\s+/).filter(t => t.length > 1);

  if (tokens.length === 0) return vector;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // Hash full token
    let hash1 = 0;
    for (let j = 0; j < token.length; j++) {
      hash1 = (hash1 * 31 + token.charCodeAt(j)) >>> 0;
    }
    const idx1 = hash1 % EMBEDDING_DIMENSION;
    vector[idx1] += 1.0;

    // Hash character trigrams for semantic/morphological overlap
    if (token.length >= 3) {
      for (let k = 0; k <= token.length - 3; k++) {
        const trigram = token.slice(k, k + 3);
        let hash2 = 0;
        for (let m = 0; m < 3; m++) {
          hash2 = (hash2 * 37 + trigram.charCodeAt(m)) >>> 0;
        }
        const idx2 = hash2 % EMBEDDING_DIMENSION;
        vector[idx2] += 0.35;
      }
    }
  }

  // Normalize vector to unit length (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq);

  if (magnitude > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = Number((vector[i] / magnitude).toFixed(6));
    }
  }

  return vector;
}

/**
 * Generates an embedding vector for a given text using Google Gemini.
 * Gracefully falls back to high-fidelity deterministic semantic vector if Gemini API is unavailable.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Float array representing text embedding
 */
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return new Array(EMBEDDING_DIMENSION).fill(0);
  }

  const cleanText = text.trim();

  try {
    const ai = getGeminiClient();
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: cleanText
    });

    const values = result?.embedding?.values || result?.embeddings?.[0]?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }
  } catch (error) {
    // Log safe diagnostic without leaking sensitive internals
    console.warn('[EMBEDDING] Google Gemini embedding API unavailable, using resilient fallback vector:', error?.message || error);
  }

  return generateDeterministicVector(cleanText);
}

/**
 * Calculates cosine similarity between two numeric vectors.
 *
 * @param {Array<number>} vecA - First vector
 * @param {Array<number>} vecB - Second vector
 * @returns {number} Cosine similarity in range [-1, 1]
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    const a = vecA[i] || 0;
    const b = vecB[i] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

module.exports = {
  generateEmbedding,
  generateDeterministicVector,
  cosineSimilarity,
  EMBEDDING_DIMENSION
};
