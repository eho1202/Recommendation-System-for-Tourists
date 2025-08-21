import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  getUserId: () => number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // Optionally refresh user data from API
            if (userData.userId) {
              const freshUserData = await userService.getUserProfile(userData.userId);
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (err) {
            console.error('Failed to parse or refresh user data', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Failed to load user information.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function - store token and user data
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setError(null);
  };

  // Logout function - clear stored data and state
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user data in context and localStorage
  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  
  // Helper to get userId safely
  const getUserId = (): number | null => {
    return user?.userId || null;
  };

  // Context value with all auth functions and state
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    updateUser,
    getUserId
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};