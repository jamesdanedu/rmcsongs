import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle, Smartphone, CloudOff } from 'lucide-react';
import { isPWAInstalled } from '../utils/serviceWorker';

/**
 * InstallPrompt component
 * Shows a prompt to install the PWA when appropriate
 * 
 * @param {Object} props - Component props
 * @param {number} props.showDelay - Delay in ms before showing the prompt (defaults to 5000)
 * @param {number} props.dismissalDuration - Duration in ms to remember dismissal (defaults to 7 days)
 * @param {string} props.position - Position of the prompt ('bottom', 'top', defaults to 'bottom')
 * @param {number} props.bottomOffset - Offset from the bottom in px (defaults to 90, above tab navigation)
 * @param {function} props.onInstall - Callback when user clicks install
 * @param {function} props.onDismiss - Callback when user dismisses the prompt
 */
const InstallPrompt = ({
  showDelay = 5000,
  dismissalDuration = 7 * 24 * 60 * 60 * 1000, // 7 days
  position = 'bottom',
  bottomOffset = 90,
  onInstall,
  onDismiss
}) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Check online status
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
  
  // Handle beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if already installed or in standalone mode
    if (isPWAInstalled()) return;
    
    // Check if the prompt has been dismissed recently
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    const isDismissedRecently = dismissedTime && 
      (Date.now() - parseInt(dismissedTime, 10)) < dismissalDuration;
    
    if (isDismissedRecently) return;
    
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
      
      // Show the prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, showDelay);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissalDuration, showDelay]);
  
  // Handle appinstalled event
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleAppInstalled = () => {
      // Hide the prompt if it's showing
      if (showPrompt) {
        setIsClosing(true);
        setTimeout(() => {
          setShowPrompt(false);
          setIsClosing(false);
        }, 300);
      }
      
      // Clear the stashed prompt
      setInstallPrompt(null);
      
      // Remember that the app has been installed
      localStorage.setItem('pwa_installed', 'true');
      
      console.log('App was installed');
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showPrompt]);
  
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // The user accepted or dismissed the install prompt
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      if (typeof onInstall === 'function') {
        onInstall();
      }
    } else {
      console.log('User dismissed the install prompt');
      
      // Remember dismissal
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    }
    
    // Clear the stashed prompt
    setInstallPrompt(null);
    
    // Close the prompt with animation
    handleClose();
  };
  
  const handleClose = () => {
    // Start closing animation
    setIsClosing(true);
    
    // After animation completes, hide the prompt
    setTimeout(() => {
      setShowPrompt(false);
      setIsClosing(false);
    }, 300);
    
    // Remember dismissal
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
    
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };
  
  if (!showPrompt) return null;
  
  // Calculate position styles
  const getPositionStyle = () => {
    if (position === 'top') {
      return {
        top: '16px',
        left: '16px',
        right: '16px',
        transform: `translateY(${isClosing ? -20 : 0}px)`
      };
    }
    
    // Default to bottom
    return {
      bottom: `${bottomOffset}px`,
      left: '16px',
      right: '16px',
      transform: `translateY(${isClosing ? 20 : 0}px)`
    };
  };
  
  return (
    <div 
      style={{
        position: 'fixed',
        ...getPositionStyle(),
        background: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 90, // Below NetworkStatus
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '448px',
        margin: '0 auto',
        transition: 'all 0.3s ease',
        opacity: isClosing ? 0 : 1,
        border: '1px solid #e0e7ff'
      }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6b7280',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={16} />
      </button>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        paddingRight: '24px' // Space for close button
      }}>
        <div style={{
          background: '#eef2ff',
          borderRadius: '50%',
          padding: '10px',
          marginRight: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Download size={24} color="#4f46e5" />
        </div>
        <div>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#4338ca', 
            marginBottom: '4px', 
            fontSize: '16px',
            margin: '0 0 4px 0'
          }}>
            Add to Home Screen
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px', 
            margin: '0'
          }}>
            Install this app for a better experience
          </p>
        </div>
      </div>
      
      {/* Features list */}
      <div style={{
        background: '#eef2ff',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <ul style={{
          margin: '0',
          padding: '0',
          listStyle: 'none'
        }}>
          <li style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '13px',
            color: '#4338ca'
          }}>
            <CheckCircle size={14} style={{ marginRight: '8px', flexShrink: 0 }} />
            <span>Access songs and votes when offline</span>
          </li>
          <li style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '13px',
            color: '#4338ca'
          }}>
            <CheckCircle size={14} style={{ marginRight: '8px', flexShrink: 0 }} />
            <span>Faster loading and smoother experience</span>
          </li>
          <li style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            color: '#4338ca'
          }}>
            <CheckCircle size={14} style={{ marginRight: '8px', flexShrink: 0 }} />
            <span>No browser interface taking up space</span>
          </li>
        </ul>
      </div>
      
      {/* Installation instructions */}
      <div style={{
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        background: isOnline ? 'rgba(79, 70, 229, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px'
      }}>
        {isOnline ? (
          <>
            <Smartphone size={16} style={{ marginRight: '8px', color: '#4f46e5' }} />
            <span style={{ fontSize: '13px', color: '#4f46e5' }}>
              Install now for the best experience
            </span>
          </>
        ) : (
          <>
            <CloudOff size={16} style={{ marginRight: '8px', color: '#ef4444' }} />
            <span style={{ fontSize: '13px', color: '#ef4444' }}>
              You're offline. Install when back online.
            </span>
          </>
        )}
      </div>
      
      {/* Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handleClose}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: '1px solid #e0e7ff',
            borderRadius: '8px',
            background: 'white',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Not Now
        </button>
        <button
          onClick={handleInstall}
          disabled={!isOnline}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            background: isOnline 
              ? 'linear-gradient(to right, #4f46e5, #2563eb)'
              : '#d1d5db',
            color: isOnline ? 'white' : '#6b7280',
            border: 'none',
            cursor: isOnline ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Download size={16} />
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
