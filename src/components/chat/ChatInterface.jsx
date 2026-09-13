import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Menu, 
  Plus, 
  Database, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Volume2,
  VolumeX,
  Square
} from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';
import ConversationSidebar from './ConversationSidebar.jsx';
import ChatMessage from './ChatMessage.jsx';
import ChatInput from './ChatInput.jsx';
import ChatWelcome from './ChatWelcome.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis.js';

const STORAGE_AUTO_SPEAK_KEY = 'ai_auto_speak';

export default function ChatInterface({ documentCount = 0, onOpenKnowledgeBase }) {
  const {
    activeConversation,
    messages,
    chatLoading,
    messageSending,
    chatError,
    sendMessage,
    createNewConversation,
    clearChatError,
    loadConversations
  } = useChat();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto Speak preference stored in localStorage
  const [autoSpeak, setAutoSpeak] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_AUTO_SPEAK_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const {
    isSupported: isTtsSupported,
    isSpeaking,
    speakingMessageId,
    speak,
    stop
  } = useSpeechSynthesis();

  // Track the last message ID we auto-spoke to prevent repeat speech
  const lastSpokenMessageIdRef = useRef(null);

  // Handle Auto Speak toggle
  const toggleAutoSpeak = () => {
    const nextVal = !autoSpeak;
    setAutoSpeak(nextVal);
    try {
      localStorage.setItem(STORAGE_AUTO_SPEAK_KEY, String(nextVal));
    } catch {
      // ignore
    }
  };

  // Auto-speak new assistant messages when auto-speak is ON
  useEffect(() => {
    if (!autoSpeak || !isTtsSupported || messages.length === 0 || messageSending) {
      return;
    }

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg && 
      lastMsg.role === 'assistant' && 
      lastMsg.id !== lastSpokenMessageIdRef.current &&
      lastMsg.content
    ) {
      lastSpokenMessageIdRef.current = lastMsg.id;
      // Slight delay so UI settles smoothly
      const timer = setTimeout(() => {
        speak(lastMsg.content, lastMsg.id);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [messages, autoSpeak, isTtsSupported, messageSending, speak]);

  // Auto-scroll to bottom whenever messages array updates or sending status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messageSending]);

  const handleSendMessage = async (text) => {
    // If speaking, stop playback when sending a new message
    if (isSpeaking) {
      stop();
    }

    try {
      await sendMessage(text);
    } catch (err) {
      // Error handled inside ChatContext and exposed via chatError
    }
  };

  const showWelcome = !activeConversation && messages.length === 0;

  return (
    <div
      id="conversational-chat-container"
      className="flex h-[720px] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative"
    >
      {/* 1. Conversation History Sidebar */}
      <ConversationSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Open conversation history"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {activeConversation?.title || (showWelcome ? 'AI Developer Assistant' : 'New Conversation')}
              </h3>
              <p className="text-2xs text-slate-500 truncate hidden sm:block">
                Powered by Google Gemini • Voice enabled &amp; workspace aware
              </p>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active speaking indicator */}
            {isSpeaking && (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-1.5 text-2xs px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors animate-pulse cursor-pointer font-medium"
                title="Click to stop AI speech"
              >
                <Square className="w-2.5 h-2.5 fill-current text-rose-600" />
                <span>AI Speaking</span>
              </button>
            )}

            {/* Auto Speak Toggle */}
            {isTtsSupported && (
              <button
                type="button"
                onClick={toggleAutoSpeak}
                className={`inline-flex items-center gap-1.5 text-2xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer border ${
                  autoSpeak
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title={`Auto-speak AI responses: ${autoSpeak ? 'ON' : 'OFF'}. Click to toggle.`}
              >
                {autoSpeak ? (
                  <Volume2 className="w-3 h-3 text-indigo-600" />
                ) : (
                  <VolumeX className="w-3 h-3 text-slate-400" />
                )}
                <span className="hidden sm:inline">Auto-speak:</span>
                <span className="font-semibold">{autoSpeak ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {/* Knowledge Base Badge */}
            {documentCount > 0 ? (
              <button
                type="button"
                onClick={onOpenKnowledgeBase}
                className="inline-flex items-center gap-1.5 text-2xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full font-medium transition-colors cursor-pointer"
                title="Knowledge Base grounded"
              >
                <Database className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">RAG Active:</span>
                <span>{documentCount} doc{documentCount === 1 ? '' : 's'}</span>
              </button>
            ) : onOpenKnowledgeBase ? (
              <button
                type="button"
                onClick={onOpenKnowledgeBase}
                className="hidden sm:inline-flex items-center gap-1 text-2xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <Database className="w-3 h-3 text-slate-500" />
                <span>Knowledge Base</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={createNewConversation}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Notification Banner */}
        {chatError && (
          <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center justify-between shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="truncate">{chatError}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => loadConversations(true)}
                className="text-rose-700 hover:text-rose-900 font-semibold text-2xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={clearChatError}
                className="text-rose-600 hover:text-rose-800 text-2xs font-semibold ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {chatLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs">Loading conversation history...</p>
            </div>
          ) : showWelcome ? (
            <ChatWelcome onSelectPrompt={handleSendMessage} />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id || `msg-${msg.createdAt}`} 
                  message={msg}
                  onSpeak={speak}
                  onStop={stop}
                  isSpeaking={isSpeaking}
                  speakingMessageId={speakingMessageId}
                  isTtsSupported={isTtsSupported}
                />
              ))}

              {/* Typing indicator when waiting for Gemini response */}
              {messageSending && <TypingIndicator />}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={messageSending}
          placeholder="Message your AI assistant..."
        />
      </div>
    </div>
  );
}
