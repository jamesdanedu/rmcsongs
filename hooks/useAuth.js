// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getUserByName, createUser } from '../lib/supabase';
import { saveUserForOffline, getOfflineUser } from '../utils/offlineStorage';

/**
 * Custom hook for authentication with offline support
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Check online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check for existing session in localStorage on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      
      try {
        // Try to get stored user
        const storedUser = localStorage.getItem('rmc_choir_user');
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // Cache for offline use
            saveUserForOffline(userData);
            
            setIsLoading(false);
            return;
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            localStorage.removeItem('rmc_choir_user');
          }
        }
        
        // If online mode failed or no stored user, check for offline user
        if (!isOnline) {
          const offlineUser = getOfflineUser();
          
          if (offlineUser) {
            setUser(offlineUser);
            setIsOfflineMode(true);
          }
        }
      } catch (err) {
        console.error('Error checking existing session:', err);
        setError('Failed to restore your session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingSession();
  }, [isOnline]);
  
  /**
   * Login function with offline support
   * @param {string|Object} usernameOrUser - Username string or user object for offline mode
   * @param {boolean} offlineMode - Whether this is an offline login
   * @returns {Promise<boolean>} Success status
   */
  const login = async (usernameOrUser, offlineMode = false) => {
    // If this is an offline login with a user object
    if (offlineMode && typeof usernameOrUser === 'object') {
      setUser(usernameOrUser);
      setIsOfflineMode(true);
      return true;
    }
    
    // Regular login requires online mode
    if (!isOnline && !offlineMode) {
      setError('Cannot login while offline. Please check your connection.');
      return false;
    }
    
    // Extract username
    const username = typeof usernameOrUser === 'string' ? usernameOrUser : usernameOrUser?.name;
    
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
      
      // Also save for offline use
      saveUserForOffline(userData);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setIsOfflineMode(false);
    localStorage.removeItem('rmc_choir_user');
    
    // We intentionally don't clear offline user cache to allow offline login later
  };
  
  /**
   * Extend session function - currently just updates last activity timestamp
   */
  const extendSession = () => {
    if (user) {
      // Update last activity timestamp
      localStorage.setItem('rmc_last_activity', Date.now().toString());
    }
  };
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isLoggedIn: !!user,
    isOfflineMode,
    isOnline,
    extendSession
  };
}
