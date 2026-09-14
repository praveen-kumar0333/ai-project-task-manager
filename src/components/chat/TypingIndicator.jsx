import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div id="ai-typing-indicator" className="flex items-start gap-3 py-2 animate-in fade-in duration-200">
      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
        </div>
        <span className="text-xs text-slate-600 font-medium">AI Assistant is thinking...</span>
      </div>
    </div>
  );
}
