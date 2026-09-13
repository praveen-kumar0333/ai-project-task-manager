import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for Web Speech API Speech Recognition.
 * Supports standard SpeechRecognition and webkitSpeechRecognition.
 * Provides live transcript, listening status, browser compatibility detection, and error handling.
 */
export function useSpeechRecognition({ onTranscriptChange, onFinalTranscript } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  // Check browser compatibility
  const isSupported = typeof window !== 'undefined' && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  /**
   * Stop speech recognition safely
   */
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore errors if recognition already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  /**
   * Start speech recognition
   */
  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');

    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Stop previous instance if running
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      isManuallyStoppedRef.current = false;

      // Configuration
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;

          if (result.isFinal) {
            currentFinal += transcriptText;
          } else {
            currentInterim += transcriptText;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            const updated = prev + separator + currentFinal.trim();
            if (onFinalTranscript) onFinalTranscript(updated);
            if (onTranscriptChange) onTranscriptChange(updated);
            return updated;
          });
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        let message = 'Speech recognition error occurred.';
        
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
            break;
          case 'no-speech':
            // No speech detected, ignore silently unless continuous is ended
            message = 'No speech was detected. Please try speaking again.';
            break;
          case 'network':
            message = 'Network error occurred during speech recognition. Please check your connection.';
            break;
          case 'audio-capture':
            message = 'No microphone was found or microphone is not working.';
            break;
          case 'aborted':
            // User aborted, do not show error
            return;
          default:
            message = `Speech recognition error: ${event.error}`;
            break;
        }

        setError(message);
        setIsListening(false);
      };

      recognition.onend = () => {
        // If it ended automatically and user did not stop manually, we update state
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Unable to start speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  }, [isSupported, onTranscriptChange, onFinalTranscript]);

  /**
   * Reset current accumulated transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setError
  };
}

export default useSpeechRecognition;
