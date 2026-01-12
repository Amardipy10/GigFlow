import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;

    if (user && user.id) {
      // 1. Get the base URL and strip the /api suffix if it exists
      let socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      socketUrl = socketUrl.replace(/\/api$/, ''); 

      // 2. Initialize socket with improved production settings
      newSocket = io(socketUrl, {
        withCredentials: true,
        // Adding transports helps avoid handshake errors on hosting providers like Render
        transports: ['websocket', 'polling'],
        // Auto-reconnect if Render spins down the server
        reconnectionAttempts: 5,
        reconnectionDelay: 5000,
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        newSocket.emit('register', user.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket Connection Error:', err.message);
      });

      newSocket.on('hired', (data) => {
        const notification = {
          id: Date.now(),
          ...data,
          timestamp: new Date(),
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on('error', (data) => {
        console.error('⚠️ Server emitted socket error:', data.message);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) newSocket.close();
      };
    } else {
      // Cleanup if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setNotifications([]);
    }
  }, [user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};