// src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const UserContext = createContext();

const USER_STORAGE_KEY = 'hayguard_current_user';

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      window.dispatchEvent(new CustomEvent('userUpdated', { 
        detail: updatedUser 
      }));
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    updateUser,
    logout,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};