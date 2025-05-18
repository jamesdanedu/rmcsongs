import { useState, useEffect } from 'react';
import { getUserByName, createUser } from '../lib/supabase';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rmc_choir_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('rmc_choir_user');
      }
    }
  }, []);
  
  // Login function
  const login = async (username) => {
    if (!username || username.trim() === '') {
      setError('Please enter your name');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user exists
      let userData = await getUserByName(username.trim());
      
      if (!userData) {
        // Create new user
        try {
          userData = await createUser(username.trim());
        } catch (err) {
          // Check for unique constraint violation (name already exists)
          if (err.code === '23505') {
            setError('This name is already taken. Please choose another name.');
            setIsLoading(false);
            return false;
          }
          throw err;
        }
      }
      
      // Store user in state and localStorage
      setUser(userData);
      localStorage.setItem('rmc_choir_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('rmc_choir_user');
  };
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isLoggedIn: !!user
  };
}