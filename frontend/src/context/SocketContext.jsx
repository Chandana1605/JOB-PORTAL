import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const s = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    s.emit('user_connected', user._id);
    s.on('online_users', setOnlineUsers);
    s.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
