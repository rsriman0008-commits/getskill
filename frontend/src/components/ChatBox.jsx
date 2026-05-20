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
          className="w-14 h-14 rounded-full primary-gradient text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-xl relative"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="w-96 h-[480px] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="primary-gradient text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              {selectedChat && (
                <button
                  onClick={() => setSelectedChat(null)}
                  className="mr-1 text-white hover:bg-white hover:bg-opacity-20 w-7 h-7 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                >
                  ←
                </button>
              )}
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  {selectedChat
                    ? (selectedChat.requester._id === user._id ? selectedChat.recipient.name : selectedChat.requester.name)
                    : 'Messages'}
                </h3>
                {selectedChat && (
                  <p className="text-[10px] text-indigo-200 truncate max-w-[200px]">
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
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-semibold"
            >
              ✕
            </button>
          </div>

          {/* Tabs (only shown when not inside a chat) */}
          {!selectedChat && (
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setTab('requests')}
                className={`flex-1 py-3 font-semibold text-xs tracking-wide uppercase transition-colors ${
                  tab === 'requests'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Requests ({requests.length})
              </button>
              <button
                onClick={() => {
                  setTab('chats');
                  loadChats();
                }}
                className={`flex-1 py-3 font-semibold text-xs tracking-wide uppercase transition-colors ${
                  tab === 'chats'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chats ({chats.length})
              </button>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50 flex flex-col">
            {selectedChat ? (
              <div className="space-y-3 flex-1">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">Connected! Send a message to start.</p>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user._id;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs shadow-sm leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <span
                            className={`block text-[9px] mt-1 text-right font-medium ${
                              isMe ? 'text-indigo-200' : 'text-slate-400'
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
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-xs">No pending requests</p>
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req._id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {req.requester.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{req.requester.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">Course: {req.course?.courseName}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mb-3 italic leading-relaxed border border-slate-100">
                        "{req.message || 'Hi! I am interested in swapping skills with you.'}"
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req._id)}
                          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-lg text-xs font-semibold transition-colors"
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
                  <div className="text-center py-12">
                    <p className="text-slate-500 text-xs">No active chats</p>
                    <p className="text-[10px] text-slate-400 mt-1">Accept skill exchange requests to start chatting</p>
                  </div>
                ) : (
                  chats.map(chat => {
                    const otherUser = chat.requester._id === user._id ? chat.recipient : chat.requester;
                    return (
                      <div
                        key={chat._id}
                        onClick={() => setSelectedChat(chat)}
                        className="bg-white p-3.5 rounded-xl hover:bg-indigo-50 border border-slate-200 shadow-sm cursor-pointer transition-all flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {otherUser.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{otherUser.name}</p>
                          <p className="text-[10px] text-indigo-600 truncate font-semibold mt-0.5">
                            {chat.course?.courseName}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-400 font-bold">💬</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Message Input (only shown when inside a chat) */}
          {selectedChat && (
            <div className="border-t border-slate-200 p-3 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.03)] flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-md"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
