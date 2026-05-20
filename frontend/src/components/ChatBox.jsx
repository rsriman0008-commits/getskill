import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../utils/api';
import io from 'socket.io-client';

const ChatBox = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState('requests'); // 'requests' or 'chats'
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to chat server');
      socketRef.current.emit('register_user', user._id);
    });

    socketRef.current.on('receive_message', (data) => {
      // Use standard react state functional update to check selectedChat without stale reference
      setSelectedChat(currentChat => {
        const otherUserId = currentChat
          ? (currentChat.requester._id === user._id ? currentChat.recipient._id : currentChat.requester._id)
          : null;

        if (otherUserId && data.senderId === otherUserId) {
          setMessages(prev => [...prev, data]);
        } else {
          setUnreadCount(prev => prev + 1);
        }
        return currentChat;
      });
    });

    socketRef.current.on('typing', ({ senderId }) => {
      console.log('User is typing:', senderId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, user]);

  // Load requests and chats on mount or tab switch
  useEffect(() => {
    if (user) {
      loadRequests();
      loadChats();
    }
  }, [user, tab]);

  const loadRequests = async () => {
    try {
      const response = await sessionAPI.getMySessions('pending');
      if (response.data.success) {
        setRequests(response.data.incoming || []);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await sessionAPI.getMySessions('accepted');
      if (response.data.success) {
        const incoming = response.data.incoming || [];
        const outgoing = response.data.outgoing || [];
        setChats([...incoming, ...outgoing]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Initialize message with session proposal message when chat selected
  useEffect(() => {
    if (selectedChat) {
      const initialMsgs = [];
      if (selectedChat.message) {
        initialMsgs.push({
          senderId: selectedChat.requester._id,
          message: selectedChat.message,
          timestamp: selectedChat.createdAt || new Date(),
          read: true
        });
      }
      setMessages(initialMsgs);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await sessionAPI.acceptSession(requestId);
      setRequests(requests.filter(r => r._id !== requestId));
      loadChats();
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await sessionAPI.declineSession(requestId);
      setRequests(requests.filter(r => r._id !== requestId));
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const recipientId = selectedChat.requester._id === user._id ? selectedChat.recipient._id : selectedChat.requester._id;

    socketRef.current?.emit('send_message', {
      senderId: user._id,
      recipientId,
      message: newMessage
    });

    setMessages(prev => [...prev, {
      senderId: user._id,
      message: newMessage,
      timestamp: new Date(),
      read: true
    }]);

    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 animate-pulse-slow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white/20 shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="w-96 h-[500px] glass-card shadow-2xl flex flex-col overflow-hidden animate-slide-up glow-purple border border-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-cyan-900/40 border-b border-white/10 text-white p-4 flex justify-between items-center backdrop-blur-lg">
            <div className="flex items-center gap-3">
              {selectedChat && (
                <button
                  onClick={() => setSelectedChat(null)}
                  className="mr-1 text-slate-300 hover:text-white hover:bg-white/10 w-7 h-7 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                >
                  ←
                </button>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-sm tracking-wide text-white truncate max-w-[200px]">
                  {selectedChat
                    ? (selectedChat.requester._id === user._id ? selectedChat.recipient.name : selectedChat.requester.name)
                    : 'Messages'}
                </h3>
                {selectedChat && (
                  <p className="text-[10px] text-cyan-400 font-medium truncate max-w-[200px] mt-0.5">
                    {selectedChat.course?.courseName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setUnreadCount(0);
              }}
              className="text-slate-400 hover:text-white hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Tabs (only shown when not inside a chat) */}
          {!selectedChat && (
            <div className="flex border-b border-white/10 bg-slate-950/40">
              <button
                onClick={() => setTab('requests')}
                className={`flex-1 py-3 font-bold text-xs tracking-wide uppercase transition-all duration-300 relative ${
                  tab === 'requests'
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Requests ({requests.length})
                {tab === 'requests' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => {
                  setTab('chats');
                  loadChats();
                }}
                className={`flex-1 py-3 font-bold text-xs tracking-wide uppercase transition-all duration-300 relative ${
                  tab === 'chats'
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Chats ({chats.length})
                {tab === 'chats' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-950/20 flex flex-col">
            {selectedChat ? (
              <div className="space-y-3 flex-1">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-8 bg-white/5 rounded-xl border border-white/5 italic">Connected! Send a message to start.</p>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user._id;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}
                      >
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs shadow-md leading-relaxed border ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500/20 rounded-tr-none'
                              : 'bg-white/10 text-white border-white/10 rounded-tl-none backdrop-blur-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <span
                            className={`block text-[9px] mt-1.5 text-right font-medium ${
                              isMe ? 'text-purple-200' : 'text-slate-400'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : tab === 'requests' ? (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-3 text-lg">📩</div>
                    <p className="text-slate-400 text-xs font-medium">No pending requests</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Incoming trade requests will appear here.</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req._id} className="bg-white/5 border border-white/10 p-3.5 rounded-xl shadow-lg smooth-transition hover:border-purple-500/30">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                          {req.requester.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate">{req.requester.name}</p>
                          <p className="text-[10px] text-cyan-400 truncate mt-0.5">Course: {req.course?.courseName}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg mb-3 italic leading-relaxed border border-white/5">
                        "{req.message || 'Hi! I am interested in swapping skills with you.'}"
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-lg shadow-purple-500/10"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req._id)}
                          className="flex-1 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white py-2 rounded-lg text-xs font-semibold transition-all duration-300 border border-white/5"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {chats.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-3 text-lg">💬</div>
                    <p className="text-slate-400 text-xs font-medium">No active chats</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">Accept skill exchange requests to start chatting.</p>
                  </div>
                ) : (
                  chats.map(chat => {
                    const otherUser = chat.requester._id === user._id ? chat.recipient : chat.requester;
                    return (
                      <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className="bg-white/5 p-3.5 rounded-xl hover:bg-white/10 border border-white/10 hover:border-purple-500/30 shadow-md cursor-pointer smooth-transition flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {otherUser.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate">{otherUser.name}</p>
                          <p className="text-[10px] text-cyan-400 truncate font-semibold mt-0.5">
                            {chat.course?.courseName}
                          </p>
                        </div>
                        <span className="text-xs text-purple-400 font-bold bg-purple-500/10 w-7 h-7 rounded-full flex items-center justify-center border border-purple-500/20">💬</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Message Input (only shown when inside a chat) */}
          {selectedChat && (
            <div className="border-t border-white/10 p-3 bg-slate-950/60 backdrop-blur-md flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white/5 text-white placeholder-slate-500 transition-all duration-300"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Send</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
