import { useState, useEffect } from 'react';
import { getUserByName, createUser, updateUser } from '../lib/supabase';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check existing session
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Prevent multiple simultaneous logins
  const [forceUpdate, setForceUpdate] = useState(0); // Force component updates
  
  // Check for existing session in localStorage on mount
  useEffect(() => {
    console.log('useAuth: Checking for existing session');
    
    try {
      const storedUser = localStorage.getItem('rmc_choir_user');
      if (storedUser) {
        console.log('Found stored user data');
        const userData = JSON.parse(storedUser);
        
        // Validate stored user data
        if (userData && userData.id && userData.name) {
          console.log('Valid stored user:', userData);
          setUser(userData);
        } else {
          console.warn('Invalid stored user data, clearing');
          localStorage.removeItem('rmc_choir_user');
        }
      } else {
        console.log('No stored user found');
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
      localStorage.removeItem('rmc_choir_user');
    } finally {
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  }, []);
  
  // Debug useEffect to track user state changes
  useEffect(() => {
    console.log('useAuth - user state changed:', user);
    console.log('useAuth - isLoggedIn computed as:', !!user);
    console.log('useAuth - forceUpdate counter:', forceUpdate);
    if (user) {
      console.log('🎉 USER IS LOGGED IN - should trigger main UI!');
    } else {
      console.log('❌ No user - should show login UI');
    }
  }, [user, forceUpdate]);
  
  // Force refresh function
  const forceRefresh = () => {
    console.log('🔄 FORCING AUTH REFRESH');
    setForceUpdate(prev => prev + 1);
  };
  
  // Login function - handles both old (string) and new (object) formats
  const login = async (credentials) => {
    if (!credentials) {
      setError('Please provide login credentials');
      return false;
    }
    
    // Prevent multiple simultaneous login attempts
    if (isLoggingIn) {
      console.log('Login already in progress, ignoring duplicate request');
      return false;
    }
    
    setIsLoggingIn(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Login attempt with credentials:', credentials);
      console.log('Credentials type:', typeof credentials);
      console.log('Credentials keys:', typeof credentials === 'object' ? Object.keys(credentials) : 'N/A');
      
      // Handle different credential formats
      let username;
      let phoneNumber;
      let isMusician;
      let userData;
      
      if (typeof credentials === 'string') {
        // Old format: just username
        username = credentials.trim();
        if (!username) {
          setError('Please enter your name');
          setIsLoading(false);
          setIsLoggingIn(false);
          return false;
        }
      } else if (typeof credentials === 'object') {
        // New format: object with fullName, phoneNumber, etc.
        username = credentials.fullName || credentials.name;
        phoneNumber = credentials.phoneNumber;
        isMusician = credentials.isMusician;
        
        if (!username || username.trim() === '') {
          setError('Please enter your full name');
          setIsLoading(false);
          setIsLoggingIn(false);
          return false;
        }
        
        username = username.trim();
        
        // Additional validation for new format
        if (phoneNumber) {
          if (!/^\+?[0-9]{10,15}$/.test(phoneNumber.replace(/\s+/g, ''))) {
            setError('Please enter a valid phone number');
            setIsLoading(false);
            setIsLoggingIn(false);
            return false;
          }
          phoneNumber = phoneNumber.trim();
        }
      } else {
        setError('Invalid credentials format');
        setIsLoading(false);
        setIsLoggingIn(false);
        return false;
      }
      
      console.log('Processed username:', username);
      console.log('Processed phone number:', phoneNumber);
      console.log('Processed is musician:', isMusician);
      
      // Check if user exists
      userData = await getUserByName(username);
      
      if (!userData) {
        console.log('User not found, creating new user');
        try {
          // Create user with additional data if provided
          const newUserData = { name: username };
          if (phoneNumber) {
            newUserData.phoneNumber = phoneNumber;
          }
          if (isMusician !== undefined) {
            newUserData.isMusician = isMusician;
          }
          
          userData = await createUser(newUserData);
        } catch (err) {
          console.error('Error creating user:', err);
          
          // Check for unique constraint violation (name already exists)
          if (err.code === '23505') {
            setError('This name is already taken. Please choose another name.');
            setIsLoading(false);
            setIsLoggingIn(false);
            return false;
          }
          throw err;
        }
      } else {
        // User exists, update phone number and musician status if provided and different
        const updateData = {};
        
        if (phoneNumber && userData.phone_number !== phoneNumber) {
          updateData.phoneNumber = phoneNumber;
        }
        
        if (isMusician !== undefined && userData.is_musician !== isMusician) {
          updateData.isMusician = isMusician;
        }
        
        if (Object.keys(updateData).length > 0) {
          console.log('Updating user with data:', updateData);
          try {
            userData = await updateUser(userData.id, updateData);
            console.log('User updated successfully');
          } catch (err) {
            console.warn('Failed to update user:', err);
            // Don't fail login if update fails, just continue with existing user data
          }
        }
      }
      
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received from server');
      }
      
      console.log('Login successful, user data:', userData);
      console.log('About to set user state...');
      
      // Store user in state and localStorage
      console.log('Setting user state with userData:', userData);
      setUser(prevUser => {
        console.log('setUser callback - prevUser:', prevUser, 'newUser:', userData);
        return userData;
      });
      localStorage.setItem('rmc_choir_user', JSON.stringify(userData));
      
      console.log('User state set, userData.id:', userData.id);
      console.log('localStorage updated');
      
      // HACK: Force a slight delay to ensure state updates properly
      // This fixes the issue where login succeeds but UI doesn't redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Completing login process...');
      setIsLoading(false);
      setIsLoggingIn(false);
      
      console.log('Login process completed, should redirect to main UI');
      console.log('Final state check - user should be:', userData);
      console.log('isLoggedIn should be:', !!userData);
      
      // Force a complete refresh of auth state
      forceRefresh();
      
      // NUCLEAR OPTION: If state updates don't work, force page reload
      setTimeout(() => {
        if (!document.querySelector('[data-main-app]')) {
          console.log('🚨 MAIN APP NOT SHOWING AFTER 1 SECOND - FORCING PAGE RELOAD');
          window.location.reload();
        } else {
          console.log('✅ Main app is showing correctly!');
        }
      }, 1000);
      
      return true;
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error types
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message?.includes('Invalid') || err.message?.includes('validation')) {
        setError(err.message);
      } else {
        setError('An error occurred during login. Please try again.');
      }
      
      setIsLoading(false);
      setIsLoggingIn(false);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setError(null);
    
    try {
      localStorage.removeItem('rmc_choir_user');
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
  };
  
  // Function to extend session (for session management)
  const extendSession = () => {
    if (user) {
      try {
        // Update the stored user data with current timestamp
        const updatedUser = {
          ...user,
          lastActivity: new Date().toISOString()
        };
        localStorage.setItem('rmc_choir_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (e) {
        console.warn('Error extending session:', e);
      }
    }
  };
  
  // Function to clear error
  const clearError = () => {
    setError(null);
  };
  
  // Debug logging for return values
  const returnValues = {
    user,
    isLoading: isLoading || isLoggingIn,
    error,
    login,
    logout,
    extendSession,
    clearError,
    isLoggedIn: !!user,
    isLoggingIn,
    forceUpdate // Include forceUpdate to trigger re-renders
  };
  
  // Log the current state values
  if (user) {
    console.log('useAuth returning - user exists:', !!user, 'isLoggedIn:', !!user, 'isLoading:', isLoading || isLoggingIn, 'forceUpdate:', forceUpdate);
  }
  
  return returnValues;
}