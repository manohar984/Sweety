import { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('sweety_token');
    const savedUser = localStorage.getItem('sweety_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('sweety_token', token);
    localStorage.setItem('sweety_user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    login(data.token, data.user);
  };

  const loginWithCredentials = async (email, password) => {
    const data = await loginUser(email, password);
    login(data.token, data.user);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    register,
    login: loginWithCredentials,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
