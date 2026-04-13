'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupportDashboard() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [reply, setReply] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [savingTags, setSavingTags] = useState(false);
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCloseConversation = async () => {
    if (!selectedConv) return;

    setClosing(true);
    try {
      const response = await fetch(`/api/chat/close/${selectedConv.id}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to close conversation');
      }
      setSelectedConv(null);
      await loadConversations();
    } catch (error) {
      console.error('Failed to close conversation:', error);
      alert('Could not close the conversation. Please try again.');
    } finally {
      setClosing(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!selectedConv || !selectedConv.messages) return;
    const unreadMessageIds = selectedConv.messages
      .filter((msg) => msg.senderType === 'customer' && !msg.read)
      .map((msg) => msg.id);
    if (!unreadMessageIds.length) return;

    setMarkingRead(true);
    try {
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv.id, messageIds: unreadMessageIds })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to mark messages read');
      }
      await loadConversations();
    } catch (error) {
      console.error('Failed to mark messages read:', error);
      alert('Could not mark messages as read. Please try again.');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleSaveTags = async () => {
    if (!selectedConv) return;
    const tags = tagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSavingTags(true);
    try {
      const response = await fetch(`/api/chat/tag/${selectedConv.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to save tags');
      }
      setSelectedConv(data.conversation);
      setTagInput('');
      await loadConversations();
    } catch (error) {
      console.error('Failed to save tags:', error);
      alert('Could not save tags. Please try again.');
    } finally {
      setSavingTags(false);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin access on mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('supportAdmin');
    if (!adminAuth) {
      router.push('/admin-login');
      return;
    }
    setIsAdmin(true);
    loadConversations();
    
    // Reload conversations every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [router, statusFilter, searchQuery]);

  const loadConversations = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (statusFilter) searchParams.set('status', statusFilter);
      if (searchQuery) searchParams.set('q', searchQuery.trim());

      const response = await fetch(`/api/chat/conversations?${searchParams.toString()}`);
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);

        if (selectedConv) {
          const updated = data.conversations.find((conv) => conv.id === selectedConv.id);
          if (updated) {
            setSelectedConv(updated);
          }
        }

        if (!selectedConv && data.conversations.length > 0) {
          setSelectedConv(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConv) return;

    setSending(true);
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          message: reply,
          senderType: 'support'
        })
      });

      setReply('');
      
      // Reload conversations to reflect the new message
      setTimeout(() => {
        loadConversations();
      }, 500);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('supportAdmin');
    router.push('/admin-login');
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Support Team Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={loadConversations}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Conversations ({conversations.length})
              </h2>
              {(() => {
                const totalUnread = conversations.reduce((sum, conv) => 
                  sum + (conv.messages ? conv.messages.filter(m => 
                    m.senderType === 'customer' && !m.read
                  ).length : 0), 0
                );
                return totalUnread > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
                  </p>
                );
              })()}
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {['open', 'closed', 'all'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status === 'all' ? '' : status)}
                      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                        (statusFilter === status || (status === 'all' && !statusFilter))
                          ? 'bg-brand-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  Total: {conversations.length} | Open: {conversations.filter(c => c.status === 'open').length} | Closed: {conversations.filter(c => c.status === 'closed').length}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-4 text-center text-slate-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No conversations yet</div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {conversations.map((conv) => {
                    const unreadCount = conv.messages ? conv.messages.filter(m => 
                      m.senderType === 'customer' && !m.read
                    ).length : 0;
                    
                    return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left p-4 transition relative ${
                        selectedConv?.id === conv.id
                          ? 'bg-brand-50 border-l-4 border-brand-900'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            Chat #{conv.id.slice(-8)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {conv.userFullName || 'Unknown user'} (Reg: {conv.userType === 'seller' ? 'S' : 'C'}{conv.userIdentifier}) • {conv.userType ? conv.userType.charAt(0).toUpperCase() + conv.userType.slice(1) : 'Customer'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(conv.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {conv.status || 'open'}
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          {selectedConv ? (
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden flex flex-col">
              {/* Header with close button */}
              <div className="p-4 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Chat #{selectedConv.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Status: {selectedConv.status || 'open'}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    User: {selectedConv.userFullName || 'Unknown user'} (Reg: {selectedConv.userType === 'seller' ? 'S' : 'C'}{selectedConv.userIdentifier}) • {selectedConv.userType ? selectedConv.userType.charAt(0).toUpperCase() + selectedConv.userType.slice(1) : 'Customer'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Started: {new Date(selectedConv.createdAt).toLocaleString()}
                  </p>
                  {selectedConv.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {selectedConv.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markingRead || closing}
                    className="px-3 py-1 rounded-full bg-brand-900 text-white text-sm transition hover:bg-brand-700 disabled:opacity-50"
                  >
                    {markingRead ? 'Marking...' : 'Mark all read'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseConversation}
                    disabled={closing}
                    className="px-3 py-1 rounded-full bg-red-600 text-white text-sm transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {closing ? 'Closing...' : 'Close Chat'}
                  </button>
                </div>
                <div className="w-full flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags, comma separated"
                    className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTags}
                    disabled={savingTags || closing}
                    className="px-4 py-2 bg-brand-900 text-white rounded-full text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                  >
                    {savingTags ? 'Saving...' : 'Save tags'}
                  </button>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {selectedConv.messages && selectedConv.messages.length > 0 ? (
                  selectedConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === 'customer' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderType === 'customer'
                            ? 'bg-brand-900 text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                          {msg.senderType === 'support' && (
                            <span className={`text-xs ml-2 ${
                              msg.read ? 'text-blue-500' : 'text-slate-400'
                            }`}>
                              {msg.read ? 'Read' : 'Delivered'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500">No messages yet</div>
                )}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response..."
                    disabled={sending}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-700 transition text-sm font-medium disabled:bg-slate-400"
                  >
                    {sending ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white rounded-lg shadow flex items-center justify-center p-8">
              <p className="text-slate-500">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
