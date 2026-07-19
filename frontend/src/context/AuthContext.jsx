/**
 * =============================================================
 * AuthContext.jsx — Keeps track of the logged-in user
 * =============================================================
 * 
 * WHAT IS "CONTEXT" IN REACT?
 * Normally, to pass data (like user info) between components,
 * you have to pass it down manually step-by-step (prop drilling).
 * Context allows us to make data "global" so ANY component
 * can grab the user's info instantly.
 * 
 * This file creates the AuthContext and a `useAuth` hook.
 * =============================================================
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// 1. Create the Context
export const AuthContext = createContext(null);

// 2. Create the Provider (this wraps our entire App in main.jsx)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Stores the logged-in user's data
  const [loading, setLoading] = useState(true); // Is it currently checking if we are logged in?

  // Function to check if the user is already logged in (when they refresh the page)
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // If no token is found on their computer, they are not logged in
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Ask the backend "Who does this token belong to?"
      const { data } = await api.get('/auth/me');
      setUser(data.user); // Save the user info
    } catch {
      // If the backend says the token is invalid/expired, delete it
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run loadUser exactly once when the app starts
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // LOGIN Function
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token); // Save the secret token
    setUser(data.user);                        // Save the user data
    return data;
  };

  // REGISTER Function
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token); // Save the secret token
    setUser(data.user);                        // Save the user data
    return data;
  };

  // LOGOUT Function
  const logout = () => {
    localStorage.removeItem('token'); // Delete the secret token
    setUser(null);                    // Remove the user data
  };

  // 3. Provide the data to the rest of the app
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook: `useAuth`
// This makes it easy for any component to get auth data.
// Example usage: const { user, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
