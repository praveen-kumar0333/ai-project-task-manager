const AppError = require('../utils/appError');

const MAX_TEXT_LENGTH = 1000;
const MURF_API_URL = 'https://api.murf.ai/v1/speech/generate';

/**
 * Checks whether MURF_API_KEY is configured on the server.
 *
 * @returns {boolean}
 */
function isMurfConfigured() {
  const key = process.env.MURF_API_KEY;
  return Boolean(
    key &&
    key.trim().length > 0 &&
    key !== 'replace_with_your_murf_api_key' &&
    key !== 'MY_MURF_API_KEY' &&
    key !== 'your_murf_api_key_here'
  );
}

/**
 * Synthesizes speech from text using Murf AI API.
 * Securely calls Murf from backend only.
 *
 * @param {string} text - Text to synthesize
 * @param {object} [options]
 * @param {string} [options.voiceId='en-US-marcus'] - Murf voice ID
 * @returns {Promise<{ audioUrl: string, format: string, duration?: number }>} Audio metadata
 */
async function generateSpeechFromText(text, options = {}) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new AppError('Text to speak is required and cannot be empty', 400);
  }

  const cleanText = text.trim();
  if (cleanText.length > MAX_TEXT_LENGTH) {
    throw new AppError(`Text exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters`, 400);
  }

  if (!isMurfConfigured()) {
    throw new AppError(
      'Murf Text-to-Speech API key is not configured on the server. Please set MURF_API_KEY in your server environment or Settings.',
      503
    );
  }

  const apiKey = process.env.MURF_API_KEY.trim();
  const voiceId = options.voiceId || 'en-US-marcus';

  const payload = {
    text: cleanText,
    voiceId,
    format: 'MP3',
    channelType: 'MONO'
  };

  try {
    const response = await fetch(MURF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.errorMessage || data?.error || `Murf API responded with status ${response.status}`;
      console.error('[MURF] API request failed:', response.status, errorMsg);
      throw new AppError(`Murf speech generation failed: ${errorMsg}`, 502);
    }

    const audioUrl = data?.audioFile || data?.audioUrl || data?.url;
    if (!audioUrl) {
      console.error('[MURF] Unexpected response format from Murf API:', data);
      throw new AppError('Murf API did not return an audio URL', 502);
    }

    return {
      audioUrl,
      format: 'MP3',
      duration: data?.audioLengthInSeconds || null
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('[MURF] Network error calling Murf API:', error?.message || error);
    throw new AppError('Unable to connect to Murf text-to-speech service', 503);
  }
}

module.exports = {
  generateSpeechFromText,
  isMurfConfigured,
  MAX_TEXT_LENGTH
};
