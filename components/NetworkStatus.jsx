import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff, Upload } from 'lucide-react';
import { getPendingActionCount } from '../utils/offlineStorage';

/**
 * NetworkStatus component
 * Displays the current network status and pending offline actions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.initialIsOnline - Initial online status (defaults to navigator.onLine)
 * @param {number} props.initialPendingCount - Initial pending action count (defaults to 0)
 * @param {number} props.onlineNotificationDuration - Duration in ms to show the online notification (defaults to 3000)
 * @param {string} props.position - Position of the component ('bottom', 'top', defaults to 'bottom')
 * @param {number} props.bottomOffset - Offset from the bottom in px (defaults to 90, above tab navigation)
 * @param {number} props.topOffset - Offset from the top in px (defaults to 16)
 */
const NetworkStatus = ({
  initialIsOnline = typeof navigator !== 'undefined' ? navigator.onLine : true,
  initialPendingCount = 0,
  onlineNotificationDuration = 3000,
  position = 'bottom',
  bottomOffset = 90,
  topOffset = 16
}) => {
  const [isOnline, setIsOnline] = useState(initialIsOnline);
  const [pendingActionsCount, setPendingActionsCount] = useState(initialPendingCount);
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Update pending actions count
  useEffect(() => {
    const updatePendingCount = () => {
      const count = getPendingActionCount();
      setPendingActionsCount(count);
    };
    
    // Update immediately
    updatePendingCount();
    
    // Set up interval for periodic updates
    const interval = setInterval(updatePendingCount, 5000);
    
    // Listen for offline action events
    const handleActionQueued = () => updatePendingCount();
    const handleActionUpdated = () => updatePendingCount();
    const handleActionRemoved = () => updatePendingCount();
    const handleActionsCleanup = () => updatePendingCount();
    
    window.addEventListener('offline-action-queued', handleActionQueued);
    window.addEventListener('offline-action-updated', handleActionUpdated);
    window.addEventListener('offline-action-removed', handleActionRemoved);
    window.addEventListener('offline-actions-cleaned', handleActionsCleanup);
    
    // Listen for service worker sync complete events
    const handleSyncComplete = () => updatePendingCount();
    window.addEventListener('sw-sync-complete', handleSyncComplete);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('offline-action-queued', handleActionQueued);
      window.removeEventListener('offline-action-updated', handleActionUpdated);
      window.removeEventListener('offline-action-removed', handleActionRemoved);
      window.removeEventListener('offline-actions-cleaned', handleActionsCleanup);
      window.removeEventListener('sw-sync-complete', handleSyncComplete);
    };
  }, []);
  
  // Handle online/offline changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      setVisible(true);
      setAnimateIn(true);
      
      // Store last online timestamp
      localStorage.setItem('rmc_last_online', Date.now().toString());
      
      // Hide notification after delay, unless there are pending actions
      if (pendingActionsCount === 0) {
        const timer = setTimeout(() => {
          setAnimateIn(false);
          // Wait for animation to complete before hiding
          setTimeout(() => setVisible(false), 300);
        }, onlineNotificationDuration);
        return () => clearTimeout(timer);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true);
      setAnimateIn(true);
    };
    
    // Set initial state based on navigator.onLine
    setIsOnline(navigator.onLine);
    if (!navigator.onLine || pendingActionsCount > 0) {
      setVisible(true);
      setAnimateIn(true);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingActionsCount, onlineNotificationDuration]);
  
  // Update visibility when pending actions count changes
  useEffect(() => {
    if (pendingActionsCount > 0) {
      setVisible(true);
      setAnimateIn(true);
    } else if (isOnline) {
      // If online and no pending actions, hide after delay
      const timer = setTimeout(() => {
        setAnimateIn(false);
        // Wait for animation to complete before hiding
        setTimeout(() => setVisible(false), 300);
      }, onlineNotificationDuration);
      return () => clearTimeout(timer);
    }
  }, [pendingActionsCount, isOnline, onlineNotificationDuration]);
  
  if (!visible) return null;
  
  // Determine background color based on status
  const getBgColor = () => {
    if (!isOnline) return '#ef4444'; // Red for offline
    if (pendingActionsCount > 0) return '#4f46e5'; // Indigo for syncing
    return '#10b981'; // Green for online
  };
  
  // Determine icon based on status
  const getIcon = () => {
    if (!isOnline) return <WifiOff size={16} />;
    if (pendingActionsCount > 0) return <Upload size={16} />;
    return <Wifi size={16} />;
  };
  
  // Determine message based on status
  const getMessage = () => {
    if (!isOnline) return 'You\'re offline';
    if (pendingActionsCount > 0) return `Syncing ${pendingActionsCount} changes...`;
    return 'You\'re back online';
  };
  
  // Position style
  const getPositionStyle = () => {
    if (position === 'top') {
      return {
        top: `${topOffset}px`,
        left: '50%',
        transform: `translateX(-50%) translateY(${animateIn ? 0 : -20}px)`
      };
    }
    
    // Default to bottom
    return {
      bottom: `${bottomOffset}px`,
      left: '50%',
      transform: `translateX(-50%) translateY(${animateIn ? 0 : 20}px)`
    };
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        ...getPositionStyle(),
        background: getBgColor(),
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 100,
        transition: 'all 0.3s ease',
        opacity: animateIn ? 1 : 0,
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: 'calc(100% - 32px)',
        pointerEvents: 'none' // Don't capture mouse events
      }}
    >
      {getIcon()}
      <span>{getMessage()}</span>
      {!isOnline && pendingActionsCount > 0 && (
        <span style={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '2px 8px',
          fontSize: '12px',
          marginLeft: '4px'
        }}>
          {pendingActionsCount} pending
        </span>
      )}
    </div>
  );
};

export default NetworkStatus;
