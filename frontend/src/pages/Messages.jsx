import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Messages.css';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef();

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (userId) loadMessages(userId);
  }, [userId]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => socket.off('receive_message');
    }
  }, [socket]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await messageAPI.getConversations();
      setConversations(data.conversations);
    } catch {}
  };

  const loadMessages = async (uid) => {
    const conv = conversations.find(c => c.other?._id === uid);
    setActiveConv(conv?.other || { _id: uid });
    try {
      const { data } = await messageAPI.getMessages(uid);
      setMessages(data.messages);
    } catch { toast.error('Failed to load messages'); }
  };

  const handleSelectConv = (conv) => {
    setActiveConv(conv.other);
    navigate(`/messages/${conv.other._id}`);
    loadMessages(conv.other._id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await messageAPI.sendMessage(activeConv._id, input.trim());
      setMessages(prev => [...prev, data.message]);
      setInput('');
      fetchConversations();
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  const isOnline = (uid) => onlineUsers.includes(uid);

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="messages-layout">
        {/* Conversations List */}
        <aside className="conv-list">
          <div className="conv-header"><h2>Messages</h2></div>
          {conversations.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>No conversations yet</div>
          ) : conversations.map(conv => (
            <div key={conv.conversationId} className={`conv-item ${activeConv?._id === conv.other?._id ? 'active' : ''}`} onClick={() => handleSelectConv(conv)}>
              <div className="conv-avatar-wrap">
                <div className="conv-avatar">{conv.other?.name?.[0]?.toUpperCase()}</div>
                {isOnline(conv.other?._id) && <div className="online-dot" />}
              </div>
              <div className="conv-info">
                <div className="conv-name">{conv.other?.name}</div>
                <div className="conv-last">{conv.lastMessage?.content?.slice(0, 35)}...</div>
              </div>
              {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
            </div>
          ))}
        </aside>

        {/* Chat Area */}
        <main className="chat-area">
          {!activeConv ? (
            <div className="chat-empty">
              <FiMessageSquare size={64} color="var(--text-light)" />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start chatting</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="conv-avatar-wrap">
                  <div className="conv-avatar">{activeConv?.name?.[0]?.toUpperCase()}</div>
                  {isOnline(activeConv?._id) && <div className="online-dot" />}
                </div>
                <div>
                  <div className="chat-name">{activeConv?.name}</div>
                  <div className="chat-status">{isOnline(activeConv?._id) ? '🟢 Online' : '⚫ Offline'}</div>
                </div>
              </div>

              <div className="messages-body">
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div key={msg._id || i} className={`message-row ${isMe ? 'mine' : 'theirs'}`}>
                      {!isMe && <div className="msg-avatar">{activeConv?.name?.[0]?.toUpperCase()}</div>}
                      <div className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                        <div className="msg-content">{msg.content}</div>
                        <div className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input className="chat-input" placeholder="Type a message..." value={input} onChange={e => setInput(e.target.value)} />
                <button type="submit" className="send-btn" disabled={sending || !input.trim()}>
                  <FiSend size={20} />
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
