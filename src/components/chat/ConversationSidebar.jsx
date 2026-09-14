import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext.jsx';

function getGroupLabel(dateString) {
  if (!dateString) return 'Older';
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const startOfPastWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (date >= startOfToday) return 'Today';
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfPastWeek) return 'Previous 7 Days';
  return 'Older';
}

export default function ConversationSidebar({ isMobileOpen, onCloseMobile }) {
  const {
    conversations,
    activeConversation,
    chatLoading,
    selectConversation,
    createNewConversation,
    deleteConversation
  } = useChat();

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleSelect = async (id) => {
    if (activeConversation?.id !== id) {
      await selectConversation(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleNewChat = () => {
    createNewConversation();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Group conversations by date
  const grouped = conversations.reduce((acc, conv) => {
    const group = getGroupLabel(conv.updatedAt || conv.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(conv);
    return acc;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200">
      {/* Top Header: New Chat & Mobile Close */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {chatLoading && conversations.length === 0 ? (
          <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading conversations...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No conversations yet</p>
            <p className="text-2xs text-slate-400 mt-1">Start a new chat to ask questions or review your projects.</p>
          </div>
        ) : (
          groupOrder.map((group) => {
            const list = grouped[group];
            if (!list || list.length === 0) return null;

            return (
              <div key={group} className="space-y-1">
                <h4 className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group}
                </h4>

                <div className="space-y-0.5">
                  {list.map((conv) => {
                    const isActive = activeConversation?.id === conv.id;
                    const isConfirming = confirmDeleteId === conv.id;
                    const isDeleting = deletingId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelect(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'bg-white text-slate-900 font-medium shadow-xs border border-slate-200'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-slate-900">{conv.title || 'Conversation'}</p>
                            {conv.lastMessage && (
                              <p className="truncate text-2xs text-slate-500 font-normal mt-0.5">
                                {conv.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Delete Action with Inline Confirmation */}
                        <div className="shrink-0 flex items-center ml-1">
                          {isConfirming ? (
                            <div className="flex items-center gap-1 bg-white border border-rose-200 rounded p-0.5 shadow-xs" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleDelete(conv.id, e)}
                                disabled={isDeleting}
                                className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700"
                                title="Confirm delete"
                              >
                                {isDeleting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : 'Delete'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(conv.id);
                              }}
                              title="Delete conversation"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 text-2xs text-slate-500 bg-white/50 flex items-center justify-between">
        <span className="truncate">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</span>
        <span className="font-semibold text-indigo-600">Gemini AI</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
