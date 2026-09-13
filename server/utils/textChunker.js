/**
 * Text Chunking Utility
 * Splits document text into manageable, overlapping chunks suitable for semantic embeddings.
 * Preserves paragraph and sentence boundaries while preventing oversized or microscopic chunks.
 */

const DEFAULT_CHUNK_SIZE = 1000; // 800 - 1200 characters
const DEFAULT_CHUNK_OVERLAP = 150; // 100 - 200 characters
const MIN_CHUNK_SIZE = 150; // Minimum meaningful chunk length

/**
 * Splits text into semantic chunks with overlap.
 *
 * @param {string} text - Cleaned source text
 * @param {object} [options]
 * @param {number} [options.chunkSize=1000] - Target character length per chunk
 * @param {number} [options.chunkOverlap=150] - Character overlap between consecutive chunks
 * @returns {Array<string>} Array of text chunks
 */
function chunkText(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap || DEFAULT_CHUNK_OVERLAP;

  // Clean raw whitespace while preserving line structure
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .trim();

  if (normalized.length <= chunkSize) {
    return normalized.length >= 10 ? [normalized] : [];
  }

  // Split primarily on paragraph breaks, falling back to sentence and space boundaries
  const paragraphs = normalized.split(/\n\s*\n/);
  const segments = [];

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (trimmedPara.length <= chunkSize) {
      segments.push(trimmedPara);
    } else {
      // Split paragraph by sentences (e.g. '.', '!', '?')
      const sentences = trimmedPara.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [trimmedPara];
      let sentenceBuffer = '';

      for (const sentence of sentences) {
        if ((sentenceBuffer + ' ' + sentence).trim().length <= chunkSize) {
          sentenceBuffer = sentenceBuffer ? `${sentenceBuffer} ${sentence.trim()}` : sentence.trim();
        } else {
          if (sentenceBuffer) {
            segments.push(sentenceBuffer);
          }
          if (sentence.trim().length <= chunkSize) {
            sentenceBuffer = sentence.trim();
          } else {
            // Hard split large single sentence on words
            const words = sentence.trim().split(/\s+/);
            let wordBuffer = '';
            for (const word of words) {
              if ((wordBuffer + ' ' + word).trim().length <= chunkSize) {
                wordBuffer = wordBuffer ? `${wordBuffer} ${word}` : word;
              } else {
                if (wordBuffer) segments.push(wordBuffer);
                wordBuffer = word;
              }
            }
            sentenceBuffer = wordBuffer;
          }
        }
      }
      if (sentenceBuffer) {
        segments.push(sentenceBuffer);
      }
    }
  }

  // Merge segments into overlapping chunks
  const chunks = [];
  let currentChunk = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (!currentChunk) {
      currentChunk = segment;
    } else if ((currentChunk + '\n\n' + segment).length <= chunkSize) {
      currentChunk += '\n\n' + segment;
    } else {
      // Push current chunk
      if (currentChunk.trim().length >= MIN_CHUNK_SIZE || chunks.length === 0) {
        chunks.push(currentChunk.trim());
      }

      // Calculate overlap from the end of currentChunk
      let overlapText = '';
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const candidate = currentChunk.slice(-chunkOverlap);
        const lastSpace = candidate.indexOf(' ');
        overlapText = lastSpace !== -1 ? candidate.slice(lastSpace + 1) : candidate;
      }

      currentChunk = overlapText ? `${overlapText}\n\n${segment}` : segment;
    }
  }

  if (currentChunk && currentChunk.trim().length > 0) {
    const finalTrimmed = currentChunk.trim();
    // If the last chunk is very small and we have previous chunks, append to last chunk if it fits
    if (finalTrimmed.length < MIN_CHUNK_SIZE && chunks.length > 0) {
      const lastIdx = chunks.length - 1;
      if ((chunks[lastIdx] + '\n\n' + finalTrimmed).length <= chunkSize * 1.3) {
        chunks[lastIdx] += '\n\n' + finalTrimmed;
      } else {
        chunks.push(finalTrimmed);
      }
    } else {
      chunks.push(finalTrimmed);
    }
  }

  return chunks;
}

module.exports = {
  chunkText,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CHUNK_OVERLAP
};
