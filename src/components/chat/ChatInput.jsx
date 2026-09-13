import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, MicOff, AlertCircle } from 'lucide-react';
import useSpeechRecognition from '../../hooks/useSpeechRecognition.js';

export default function ChatInput({ onSendMessage, isSending, placeholder = "Message your AI assistant..." }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const baseTextRef = useRef('');

  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    setError: setSpeechError
  } = useSpeechRecognition();

  // Auto-focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Sync speech transcript into textarea text while listening
  useEffect(() => {
    if (isListening && transcript) {
      const base = baseTextRef.current;
      const combined = base ? `${base.trim()} ${transcript}` : transcript;
      setText(combined);

      // Auto resize
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      }
    }
  }, [transcript, isListening]);

  // Handle toggling microphone on/off
  const handleToggleMic = () => {
    if (!isSpeechSupported) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      // Record current text so speech appends naturally
      baseTextRef.current = text;
      resetTranscript();
      startListening();
    }
  };

  const handleSend = () => {
    // If listening, stop microphone before sending
    if (isListening) {
      stopListening();
    }

    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    onSendMessage(trimmed);
    setText('');
    resetTranscript();
    baseTextRef.current = '';

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    baseTextRef.current = e.target.value;
    // Auto-expand textarea up to max height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const isBlank = !text.trim();

  return (
    <div id="chat-input-container" className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
      {/* Listening Banner or Live Speech Status */}
      {isListening && (
        <div className="mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-rose-700 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="font-semibold text-2xs uppercase tracking-wider">Listening...</span>
            <span className="text-slate-600 italic truncate text-xs">
              {interimTranscript ? `"${interimTranscript}"` : 'Speak naturally now'}
            </span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-2xs text-rose-600 hover:text-rose-800 font-semibold px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
          >
            Done speaking
          </button>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-2xs text-amber-700 hover:text-amber-900 font-medium px-1 rounded hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className={`relative rounded-xl border transition-all shadow-2xs bg-white ${
        isListening
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100'
      }`}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening to your voice... (edit text anytime)" : placeholder}
          rows={1}
          maxLength={4000}
          disabled={isSending}
          className="w-full py-3 pl-3.5 pr-20 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent resize-none focus:outline-hidden disabled:opacity-60 max-h-40 min-h-[44px]"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
          {/* Microphone Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isSending}
            title={
              !isSpeechSupported
                ? "Speech recognition is not supported in this browser"
                : isListening
                ? "Click to stop listening"
                : "Speak into microphone (Voice Input)"
            }
            className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
              !isSpeechSupported
                ? 'text-slate-300 cursor-not-allowed'
                : isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-pulse ring-2 ring-rose-300'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isBlank || isSending}
            title={isSending ? "AI is responding..." : "Send message (Enter)"}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1 text-2xs text-slate-500">
        <span className="flex items-center gap-1">
          <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Enter</kbd> to send</span>
          <span className="text-slate-300">•</span>
          <span>Click <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono">Mic</kbd> for voice</span>
        </span>
        {text.length > 3000 && (
          <span className="text-amber-600">{text.length}/4000</span>
        )}
      </div>
    </div>
  );
}
