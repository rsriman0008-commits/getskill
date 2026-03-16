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
      setMessages(prev => [...prev, data]);
      setUnreadCount(prev => prev + 1);
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

  // Load requests on mount
  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      const response = await sessionAPI.getMySessions('pending');
      if (response.data.success) {
        setRequests(response.data.incoming);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await sessionAPI.acceptSession(requestId);
      setRequests(requests.filter(r => r._id !== requestId));
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

    socketRef.current?.emit('send_message', {
      senderId: user._id,
      recipientId: selectedChat.requester._id === user._id ? selectedChat.recipient._id : selectedChat.requester._id,
      message: newMessage
    });

    setMessages([...messages, {
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
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full primary-gradient text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-xl relative"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200">
          {/* Header */}
          <div className="primary-gradient text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setTab('requests')}
              className={`flex-1 py-3 font-medium text-sm transition-colors ${
                tab === 'requests'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Requests ({requests.length})
            </button>
            <button
              onClick={() => setTab('chats')}
              className={`flex-1 py-3 font-medium text-sm transition-colors ${
                tab === 'chats'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Chats
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tab === 'requests' ? (
              <div className="p-4 space-y-3">
                {requests.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-8">No pending requests</p>
                ) : (
                  requests.map(req => (
                    <div key={req._id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <p className="font-semibold text-sm mb-2">{req.requester.name}</p>
                      <p className="text-xs text-slate-600 mb-3">{req.message}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req._id)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded text-xs font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded text-xs font-medium transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {chats.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-8">No active chats</p>
                ) : (
                  chats.map(chat => (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat?._id === chat._id
                          ? 'bg-indigo-100 border border-indigo-300'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <p className="font-semibold text-sm">{chat.requester._id === user._id ? chat.recipient.name : chat.requester.name}</p>
                      <p className="text-xs text-slate-600 truncate">{chat.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Message Input (only show in chats tab when chat selected) */}
          {tab === 'chats' && selectedChat && (
            <div className="border-t border-slate-200 p-3 bg-slate-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;
