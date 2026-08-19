import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('library_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('library_token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load latest user profile on refresh if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('library_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to fetch user context', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('library_token', newToken);
    localStorage.setItem('library_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return userData;
  };

  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('library_token', newToken);
    localStorage.setItem('library_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return newUser;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('library_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAdmin: user?.role === 'admin',
        isLibrarian: user?.role === 'librarian' || user?.role === 'admin',
        isMember: user?.role === 'member',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
