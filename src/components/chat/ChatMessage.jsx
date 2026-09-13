import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, FileText, Volume2, Square, VolumeX } from 'lucide-react';

export default function ChatMessage({ 
  message, 
  onSpeak, 
  onStop, 
  isSpeaking = false, 
  speakingMessageId = null,
  isTtsSupported = true 
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isThisMessageSpeaking = !isUser && isSpeaking && String(speakingMessageId) === String(message.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard copy fallback
    }
  };

  const handleToggleSpeak = () => {
    if (isThisMessageSpeaking) {
      if (onStop) onStop();
    } else {
      if (onSpeak) onSpeak(message.content, message.id);
    }
  };

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div
      id={`chat-message-${message.id}`}
      className={`flex gap-3 my-1.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
    >
      {/* AI Assistant Avatar */}
      {!isUser && (
        <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 transition-colors ${
          isThisMessageSpeaking ? 'bg-indigo-700 ring-2 ring-indigo-300' : 'bg-indigo-600'
        }`}>
          {isThisMessageSpeaking ? (
            <Volume2 className="w-4 h-4 animate-pulse" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>
      )}

      {/* Message Content Bubble */}
      <div className={`max-w-2xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
            isUser
              ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
              : isThisMessageSpeaking
              ? 'bg-white border-2 border-indigo-400 text-slate-800 rounded-tl-xs shadow-md ring-2 ring-indigo-50'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
          }`}
        >
          {/* Speaking active banner if message is currently being read aloud */}
          {isThisMessageSpeaking && (
            <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-indigo-100 text-2xs font-semibold text-indigo-700">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span>Speaking response...</span>
            </div>
          )}

          {/* Main message text with preserved line breaks and whitespace */}
          <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm selection:bg-indigo-100 selection:text-indigo-900">
            {message.content}
          </div>

          {/* RAG Knowledge Base Sources (if grounded) */}
          {!isUser && Array.isArray(message.sources) && message.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-2xs uppercase tracking-wider mb-1.5">
                <FileText className="w-3 h-3" />
                <span>Grounded in Knowledge Base</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-900 text-2xs rounded-md font-medium"
                    title={`Relevance: ${src.relevanceScore ? Math.round(src.relevanceScore * 100) + '%' : 'High'}`}
                  >
                    <span>📄 {src.documentName}</span>
                    {src.relevanceScore && (
                      <span className="text-indigo-600 font-normal">
                        ({Math.round(src.relevanceScore * 100)}%)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info: timestamp, listen button & copy action */}
        <div className="flex items-center gap-2 mt-1 px-1 text-2xs text-slate-500">
          <span>{formattedTime}</span>

          {!isUser && (
            <>
              {/* Text to speech Listen / Stop button */}
              {isTtsSupported && (
                <button
                  type="button"
                  onClick={handleToggleSpeak}
                  title={isThisMessageSpeaking ? "Stop speaking" : "Listen to response aloud"}
                  className={`inline-flex items-center gap-1 transition-colors cursor-pointer px-1.5 py-0.5 rounded font-medium ${
                    isThisMessageSpeaking
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      : 'hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  {isThisMessageSpeaking ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              )}

              {/* Copy button */}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy message to clipboard"
                className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-slate-100"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-semibold text-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
