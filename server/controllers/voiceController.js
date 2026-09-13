const murfService = require('../services/murfService');
const AppError = require('../utils/appError');

/**
 * POST /api/voice/speak
 * Generates text-to-speech audio via Murf AI backend service.
 */
async function speakText(req, res, next) {
  try {
    const { text, voiceId } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return next(new AppError('Text to speak is required and cannot be empty', 400));
    }

    const cleanText = text.trim();
    if (cleanText.length > murfService.MAX_TEXT_LENGTH) {
      return next(
        new AppError(`Text exceeds maximum allowed length of ${murfService.MAX_TEXT_LENGTH} characters`, 400)
      );
    }

    const audioData = await murfService.generateSpeechFromText(cleanText, { voiceId });

    res.status(200).json({
      success: true,
      message: 'Speech synthesized successfully',
      data: audioData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/voice/status
 * Informs the client whether voice synthesis (Murf API key) is configured on the backend.
 */
async function getVoiceStatus(req, res) {
  const configured = murfService.isMurfConfigured();
  res.status(200).json({
    success: true,
    data: {
      isConfigured: configured
    }
  });
}

module.exports = {
  speakText,
  getVoiceStatus
};
