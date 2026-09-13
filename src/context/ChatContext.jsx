import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';
import { 
  getConversations, 
  getConversationById, 
  createConversation as apiCreateConversation, 
  deleteConversation as apiDeleteConversation, 
  sendChatMessage 
} from '../services/api.js';

const ChatContext = createContext(null);

const STORAGE_ACTIVE_CONV_KEY = 'chat_active_conversation_id';

export function ChatProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [chatError, setChatError] = useState('');

  /**
   * Clear error notification
   */
  const clearChatError = useCallback(() => {
    setChatError('');
  }, []);

  /**
   * Load messages for a given conversation ID
   */
  const selectConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_ACTIVE_CONV_KEY);
      } catch {
        // Ignore storage errors
      }
      return;
    }

    setChatLoading(true);
    setChatError('');

    try {
      const response = await getConversationById(conversationId);
      const convData = response?.data?.conversation || response?.data;
      if (!convData) {
        throw new Error('Conversation not found.');
      }

      setActiveConversation({
        id: convData.id,
        title: convData.title || 'Conversation',
        createdAt: convData.createdAt,
        updatedAt: convData.updatedAt
      });

      // Sort messages chronologically
      const sortedMessages = Array.isArray(convData.messages)
        ? [...convData.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [];

      setMessages(sortedMessages);

      try {
        localStorage.setItem(STORAGE_ACTIVE_CONV_KEY, String(conversationId));
      } catch {
        // Ignore storage errors
      }
    } catch (err) {
      console.error('Failed to select conversation:', err);
      setChatError(err?.message || 'Failed to load conversation messages.');
      // If not found or forbidden, clear active conversation
      if (err?.status === 404 || err?.status === 403) {
        setActiveConversation(null);
        setMessages([]);
        try {
          localStorage.removeItem(STORAGE_ACTIVE_CONV_KEY);
        } catch {
          // Ignore storage errors
        }
      }
    } finally {
      setChatLoading(false);
    }
  }, []);

  /**
   * Load conversations for authenticated user and restore active session if available
   */
  const loadConversations = useCallback(async (preserveActive = true) => {
    if (!isAuthenticated) return;

    setChatLoading(true);
    setChatError('');

    try {
      const response = await getConversations();
      const list = response?.data?.conversations || response?.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setConversations(safeList);

      let savedActiveId = null;
      try {
        savedActiveId = localStorage.getItem(STORAGE_ACTIVE_CONV_KEY);
      } catch {
        // Ignore storage errors
      }

      if (preserveActive && savedActiveId) {
        const matching = safeList.find(c => String(c.id) === String(savedActiveId));
        if (matching) {
          await selectConversation(matching.id);
          return;
        }
      }

      // If active conversation is already set and exists in refreshed list, keep it
      if (preserveActive && activeConversation?.id) {
        const stillExists = safeList.some(c => c.id === activeConversation.id);
        if (stillExists) {
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      if (!err?.isUnauthorized) {
        setChatError(err?.message || 'Failed to retrieve conversation history.');
      }
    } finally {
      setChatLoading(false);
    }
  }, [isAuthenticated, activeConversation?.id, selectConversation]);

  /**
   * Start a new chat session (clears active state to display welcome screen)
   */
  const createNewConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
    setChatError('');
    try {
      localStorage.removeItem(STORAGE_ACTIVE_CONV_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  /**
   * Send a chat message with optimistic UI and error recovery
   */
  const sendMessage = useCallback(async (messageText) => {
    const text = (messageText || '').trim();
    if (!text || messageSending) return;

    setChatError('');
    setMessageSending(true);

    const targetConvId = activeConversation?.id || null;
    const tempMessageId = `temp-${Date.now()}`;

    // Optimistic user message
    const optimisticUserMsg = {
      id: tempMessageId,
      conversationId: targetConvId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const response = await sendChatMessage({
        message: text,
        conversationId: targetConvId
      });

      const responseData = response?.data;
      const returnedConvId = responseData?.conversationId;
      const assistantMsg = responseData?.response;

      if (!assistantMsg) {
        throw new Error('Received empty response from assistant.');
      }

      // If this was a new conversation created automatically by the backend
      if (!targetConvId && returnedConvId) {
        try {
          localStorage.setItem(STORAGE_ACTIVE_CONV_KEY, String(returnedConvId));
        } catch {
          // Ignore storage errors
        }

        // Fetch full conversation details to get generated title and metadata
        try {
          const convRes = await getConversationById(returnedConvId);
          const fullConv = convRes?.data?.conversation || convRes?.data;
          if (fullConv) {
            setActiveConversation({
              id: fullConv.id,
              title: fullConv.title,
              createdAt: fullConv.createdAt,
              updatedAt: fullConv.updatedAt
            });

            // Update messages from canonical backend record if available
            if (Array.isArray(fullConv.messages) && fullConv.messages.length > 0) {
              setMessages(fullConv.messages);
            } else {
              setMessages(prev => [
                ...prev.filter(m => m.id !== tempMessageId),
                { ...optimisticUserMsg, conversationId: returnedConvId },
                assistantMsg
              ]);
            }
          }
        } catch {
          // Fallback if detail fetch fails
          setActiveConversation({
            id: returnedConvId,
            title: text.length > 40 ? text.slice(0, 37) + '...' : text,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setMessages(prev => [
            ...prev.filter(m => m.id !== tempMessageId),
            { ...optimisticUserMsg, conversationId: returnedConvId },
            assistantMsg
          ]);
        }

        // Refresh conversation sidebar list to show new conversation with title and preview
        try {
          const listRes = await getConversations();
          const list = listRes?.data?.conversations || listRes?.data || [];
          if (Array.isArray(list)) {
            setConversations(list);
          }
        } catch (listErr) {
          console.warn('Could not refresh conversations list:', listErr);
        }
      } else {
        // Multi-turn in an existing conversation
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempMessageId),
          { ...optimisticUserMsg, conversationId: targetConvId },
          assistantMsg
        ]);

        // Update preview in sidebar
        setConversations(prev => prev.map(c => {
          if (c.id === targetConvId) {
            return {
              ...c,
              lastMessage: assistantMsg.content?.slice(0, 100) || text.slice(0, 100),
              updatedAt: new Date().toISOString(),
              messageCount: (c.messageCount || 0) + 2
            };
          }
          return c;
        }));
      }

      return assistantMsg;
    } catch (err) {
      console.error('Failed to send chat message:', err);
      // Remove optimistic message on failure so user can retry cleanly
      setMessages(prev => prev.filter(m => m.id !== tempMessageId));
      setChatError(err?.message || 'Failed to send message. Please try again.');
      throw err;
    } finally {
      setMessageSending(false);
    }
  }, [activeConversation?.id, messageSending]);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId) return;

    setChatError('');

    try {
      await apiDeleteConversation(conversationId);

      // Remove from list
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      // If deleted conversation was currently active, reset to welcome screen
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        try {
          localStorage.removeItem(STORAGE_ACTIVE_CONV_KEY);
        } catch {
          // Ignore storage errors
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setChatError(err?.message || 'Failed to delete conversation.');
      throw err;
    }
  }, [activeConversation?.id]);

  // Automatically load conversations when authenticated; clear state on logout
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations(true);
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setChatError('');
      try {
        localStorage.removeItem(STORAGE_ACTIVE_CONV_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  }, [isAuthenticated, loadConversations]);

  const value = useMemo(() => ({
    conversations,
    activeConversation,
    messages,
    chatLoading,
    messageSending,
    chatError,
    loadConversations,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearChatError
  }), [
    conversations,
    activeConversation,
    messages,
    chatLoading,
    messageSending,
    chatError,
    loadConversations,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearChatError
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export default ChatContext;
