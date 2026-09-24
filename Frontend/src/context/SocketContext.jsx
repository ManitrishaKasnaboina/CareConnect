import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Only connect when user is logged in
    if (token && user) {
      const socketUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        transports: ['polling', 'websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time server');
        setIsConnected(true);
        // Automatically join a room for this user
        newSocket.emit('join', `user_${user._id}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
        setIsConnected(false);
      });

      newSocket.on('bookingNotification', notification => {
        setNotifications(current => [
          { ...notification, id: `${Date.now()}-${Math.random()}` },
          ...current
        ].slice(0, 20));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // Clean up if user logs out
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [token, user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
