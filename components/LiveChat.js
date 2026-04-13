"use client";

import { useState, useEffect, useRef } from 'react';
import { getCurrentCustomer, getCurrentSeller } from '../lib/auth';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInProgress, setPollingInProgress] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    const currentCustomer = getCurrentCustomer();
    const currentSeller = getCurrentSeller();

    if (currentCustomer) {
      setAuthenticatedUser({
        id: currentCustomer.id,
        type: 'customer',
        fullName: currentCustomer.name || currentCustomer.email
      });
    } else if (currentSeller) {
      setAuthenticatedUser({
        id: currentSeller.id,
        type: 'seller',
        fullName: currentSeller.businessName || currentSeller.email
      });
    }
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          text: `Hello ${authenticatedUser.fullName}! 👋 Need help? Our support team is here 24/7. How can we assist you?`
        }
      ]);
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (authenticatedUser) {
      initializeConversation();
    }
  }, [authenticatedUser]);

  const initializeConversation = async () => {
    if (!authenticatedUser) return;

    try {
      const userIdentifier = `${authenticatedUser.type}:${authenticatedUser.id}`;
      const userFullName = authenticatedUser.fullName || 'Unknown User';

      const response = await fetch('/api/chat/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier,
          userType: authenticatedUser.type,
          userFullName
        })
      });

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        localStorage.setItem('liveChatConversationId', data.conversationId);

        // Load existing messages if any
        if (data.messages && data.messages.length > 0) {
          const storedMessages = data.messages.map(msg => ({
            id: msg.id,
            type: msg.senderType === 'customer' ? 'user' : 'bot',
            text: msg.text,
            status: msg.status,
            read: msg.read,
            timestamp: msg.timestamp
          }));
          setMessages(storedMessages);
        } else {
          // Keep default welcome message
          setMessages([{
            id: 1,
            type: 'bot',
            text: 'Hello! 👋 Need help? Our support team is here 24/7. How can we assist you?'
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      // Fallback: create local conversation ID
      const newId = `chat_${Date.now()}`;
      localStorage.setItem('liveChatConversationId', newId);
      setConversationId(newId);
      setMessages([{
        id: 1,
        type: 'bot',
        text: 'Hello! 👋 Need help? Our support team is here 24/7. How can we assist you?'
      }]);
    }
  };

  // Start polling when chat is open
  useEffect(() => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }

    if (isOpen && conversationId && !loading) {
      // Delay polling to ensure initialization and any ongoing operations are complete
      const startPolling = setTimeout(() => {
        setIsPolling(true);
        pollingIntervalRef.current = setInterval(() => {
          if (!pollingInProgress && !loading) {
            loadConversation(conversationId, true);
          }
        }, 10000); // Poll every 10 seconds
      }, 3000); // Wait 3 seconds after chat opens

      return () => {
        clearTimeout(startPolling);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
          setIsPolling(false);
        }
      };
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setIsPolling(false);
      }
    };
  }, [isOpen, conversationId, pollingInProgress, loading]);

  // Cleanup polling when chat closes
  useEffect(() => {
    if (!isOpen && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
      setPollingInProgress(false);
    }
  }, [isOpen]);

  const loadConversation = async (convId, isPolling = false) => {
    if (!isPolling || pollingInProgress) return;

    setPollingInProgress(true);

    try {
      const response = await fetch('/api/chat/conversations');
      const data = await response.json();

      if (data.conversations && data.conversations.length > 0) {
        const conversation = data.conversations.find(c => c.id === convId);
        if (conversation && conversation.messages.length > 0) {
          // Convert stored messages to display format
          const storedMessages = conversation.messages.map(msg => ({
            id: msg.id,
            type: msg.senderType === 'customer' ? 'user' : 'bot',
            text: msg.text,
            status: msg.status,
            read: msg.read,
            timestamp: msg.timestamp
          }));

          // Get existing message IDs
          const existingIds = new Set(messages.map(m => m.id));

          // Only add messages that don't already exist
          const newMessages = storedMessages.filter(m => !existingIds.has(m.id));

          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversation during polling:', error);
    } finally {
      setPollingInProgress(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId) return;

    try {
      // Get all support messages that aren't read yet
      const unreadSupportMessages = messages.filter(m => 
        m.type === 'bot' && m.id !== 1 && !m.read
      );

      if (unreadSupportMessages.length > 0) {
        const messageIds = unreadSupportMessages.map(m => m.id);
        
        await fetch('/api/chat/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            messageIds
          })
        });

        // Update local messages to show as read
        setMessages(prev => prev.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, read: true, status: 'read' }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  if (!authenticatedUser) {
    return null;
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || loading) return;

    setLoading(true);
    setPollingInProgress(true); // Pause polling during send
    const messageText = input;
    setInput('');

    try {
      // Send message to API first
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageText,
          senderType: authenticatedUser.type
        })
      });

      const data = await response.json();

      if (data.success && data.message) {
        // Add the message from API response to avoid duplicates
        const userMessage = {
          id: data.message.id,
          type: 'user',
          text: data.message.text,
          status: data.message.status,
          read: data.message.read,
          timestamp: data.message.timestamp
        };

        setMessages(prev => [...prev, userMessage]);

        // Simulate bot acknowledgment
        setTimeout(() => {
          const botResponse = {
            id: `msg_${Date.now() + 1000}`,
            type: 'bot',
            text: 'Thanks for your message! A team member will respond shortly. For urgent matters, email us at deichmannltd@gmail.com or call +44 7444 070965.'
          };
          setMessages(prev => [...prev, botResponse]);
        }, 800);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      // Add the message locally as failed if API fails
      const failedMessage = {
        id: `msg_${Date.now()}`,
        type: 'user',
        text: messageText,
        status: 'failed'
      };
      setMessages(prev => [...prev, failedMessage]);
    } finally {
      setLoading(false);
      // Resume polling after a short delay
      setTimeout(() => setPollingInProgress(false), 1000);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-brand-900 text-white shadow-lg hover:bg-brand-700 transition-all duration-300 hover:shadow-xl"
        aria-label="Open live chat"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <svg
          className={`w-6 h-6 transition-transform duration-300 absolute ${isOpen ? 'scale-100' : 'scale-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
          {/* Header */}
          <div className="bg-brand-900 text-white p-4">
            <h3 className="font-semibold">Live Chat Support</h3>
            <p className="text-sm text-brand-100">We typically reply in minutes</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg relative ${
                    msg.type === 'user'
                      ? 'bg-brand-900 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  
                  {/* Status indicator for user messages */}
                  {msg.type === 'user' && msg.status && (
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      {msg.status === 'sent' && (
                        <span className="text-xs opacity-70">✓</span>
                      )}
                      {msg.status === 'delivered' && (
                        <span className="text-xs opacity-70">✓✓</span>
                      )}
                      {msg.status === 'read' && (
                        <span className="text-xs text-blue-300">✓✓</span>
                      )}
                    </div>
                  )}
                  
                  {/* Status indicator for support messages */}
                  {msg.type === 'bot' && msg.id !== 1 && msg.status && (
                    <div className="flex items-center justify-start mt-1">
                      {msg.read ? (
                        <span className="text-xs text-blue-500">Read</span>
                      ) : (
                        <span className="text-xs text-slate-400">Delivered</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Polling indicator */}
            {isPolling && isOpen && (
              <div className="flex justify-center">
                <div className="text-xs text-slate-400">Live chat active...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-700 transition text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
