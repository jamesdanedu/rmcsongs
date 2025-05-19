// components/SessionManager.jsx
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const SESSION_EXTENSION_INTERVAL = 1000 * 60 * 60; // 1 hour

const SessionManager = ({ children }) => {
  const { isLoggedIn, extendSession } = useAuth();
  
  useEffect(() => {
    if (!isLoggedIn) return;
    
    // Set up session extension
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    let activityTimeout;
    
    const handleUserActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        extendSession();
      }, 5000); // Debounce for 5 seconds
    };
    
    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Set up an interval to periodically check and extend the session
    const intervalId = setInterval(() => {
      extendSession();
    }, SESSION_EXTENSION_INTERVAL);
    
    return () => {
      // Clean up
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
      clearTimeout(activityTimeout);
    };
  }, [isLoggedIn, extendSession]);
  
  return children;
};

export default SessionManager;