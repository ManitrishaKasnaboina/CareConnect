import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

const normalizeUser = (userData) => ({
  ...userData,
  role: String(userData?.role || '').trim().toUpperCase(),
});

export const AuthProvider = ({ children }) => {
  const savedUser = localStorage.getItem('careconnect_user');
  const [user, setUser] = useState(() => {
    try {
      return savedUser ? normalizeUser(JSON.parse(savedUser)) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('careconnect_token'));

  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('careconnect_token');

      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await API.get('/auth/me');
          const verifiedUser = {
            _id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            role: String(res.data.role || '').toUpperCase(),
          };
          setUser(normalizeUser(verifiedUser));
          localStorage.setItem('careconnect_user', JSON.stringify(verifiedUser));
        } catch (error) {
          console.error('Auth verification failed:', error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('careconnect_token');
          localStorage.removeItem('careconnect_user');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: jwtToken, ...userData } = res.data;
    
    setToken(jwtToken);
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    
    localStorage.setItem('careconnect_token', jwtToken);
    localStorage.setItem('careconnect_user', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const register = async (name, email, password, role = 'CUSTOMER') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    const { token: jwtToken, ...userData } = res.data;

    setToken(jwtToken);
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);

    localStorage.setItem('careconnect_token', jwtToken);
    localStorage.setItem('careconnect_user', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const googleLogin = async (token, role = 'CUSTOMER') => {
    const res = await API.post('/auth/google', { token, role });
    const { token: jwtToken, ...userData } = res.data;

    setToken(jwtToken);
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);

    localStorage.setItem('careconnect_token', jwtToken);
    localStorage.setItem('careconnect_user', JSON.stringify(normalizedUser));
    return normalizedUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('careconnect_token');
    localStorage.removeItem('careconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
