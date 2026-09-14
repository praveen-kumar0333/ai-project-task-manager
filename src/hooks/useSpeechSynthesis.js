import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Clean markdown and technical formatting from text so it reads aloud naturally
 */
function cleanTextForSpeech(rawText) {
  if (!rawText) return '';
  return rawText
    // Remove markdown code blocks
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove markdown links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bullet points / numbering prefixes
    .replace(/^[\*\-\+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // Collapse excess whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Custom hook for Web Speech API Text-to-Speech (SpeechSynthesis).
 * Handles voice playback, tracking active message ID, single-instance enforcement,
 * and clean cancellation.
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [error, setError] = useState(null);

  const utteranceRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && Boolean(
    'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  );

  /**
   * Stop any active speech immediately
   */
  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        // ignore
      }
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setSpeakingMessageId(null);
  }, [isSupported]);

  /**
   * Speak the provided text aloud.
   * If another message is speaking, it cancels the previous one first.
   */
  const speak = useCallback((text, messageId = null) => {
    setError(null);

    if (!isSupported) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    if (!text || !text.trim()) {
      return;
    }

    // Cancel any ongoing speech so only one instance plays at any time
    stop();

    try {
      const readableText = cleanTextForSpeech(text);
      if (!readableText) return;

      const utterance = new SpeechSynthesisUtterance(readableText);
      utteranceRef.current = utterance;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Prefer natural English voices
        const preferredVoice = voices.find(v => 
          (v.lang === 'en-US' || v.lang.startsWith('en')) && 
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setSpeakingMessageId(messageId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
      };

      utterance.onerror = (event) => {
        // 'interrupted' or 'canceled' happens normally when stopped by user
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('SpeechSynthesis error:', event.error);
          setError(`Text-to-speech error: ${event.error}`);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingMessageId(null);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis initiation error:', err);
      setError('Failed to initiate text-to-speech.');
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }, [isSupported, stop]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (isSupported && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    speakingMessageId,
    error,
    speak,
    stop,
    pause,
    resume
  };
}

export default useSpeechSynthesis;
