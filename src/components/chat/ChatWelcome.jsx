import React from 'react';
import { Bot, Sparkles, ChevronRight, FolderKanban, CheckSquare, ShieldCheck, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const SUGGESTED_PROMPTS = [
  {
    icon: FolderKanban,
    label: "Help me organize my project",
    prompt: "Help me organize my project structure and architecture for scalability."
  },
  {
    icon: CheckSquare,
    label: "What tasks should I focus on today?",
    prompt: "What tasks should I focus on today based on high-priority items?"
  },
  {
    icon: ShieldCheck,
    label: "Explain JWT authentication",
    prompt: "Explain JWT authentication, token storage best practices, and security headers."
  },
  {
    icon: Compass,
    label: "Help me plan my next sprint",
    prompt: "Help me plan my next sprint: prioritize backlog tasks and estimate scope."
  }
];

export default function ChatWelcome({ onSelectPrompt }) {
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'Developer';

  return (
    <div id="chat-welcome-screen" className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-8 animate-in fade-in duration-300">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
        <Bot className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-1">
        Hello, {userName} 👋
      </h3>
      <p className="text-sm font-medium text-slate-600 mb-2">
        How can I help you today?
      </p>
      <p className="text-xs text-slate-500 mb-8 max-w-md leading-relaxed">
        I can help you review your workspace projects, prioritize urgent tasks, draft architectural solutions, or plan upcoming development sprints.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {SUGGESTED_PROMPTS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl text-xs text-slate-700 transition-all flex items-start gap-2.5 shadow-2xs group cursor-pointer text-left"
            >
              <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-900 block truncate">{item.label}</span>
                <span className="text-2xs text-slate-500 block truncate mt-0.5">{item.prompt}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
