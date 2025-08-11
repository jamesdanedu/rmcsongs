'use client';

import { useEffect, useState } from 'react';
import ChoirSongAppStyled from '../components/ChoirSongAppStyled';
import { registerServiceWorker } from '../utils/serviceWorker';

export default function Home() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Register service worker on client side
    const registerSW = async () => {
      try {
        // Register the service worker
        const registration = await registerServiceWorker();
        
        if (registration) {
          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  setIsUpdateAvailable(true);
                }
              };
            }
          };
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };
    
    registerSW();
    
    // Store online timestamp when page loads
    if (navigator.onLine) {
      localStorage.setItem('rmc_last_online', Date.now().toString());
    }
  }, []);
  
  const handleRefresh = () => {
    // Reload the page to apply updates
    window.location.reload();
  };
  
  return (
    <>
      <ChoirSongAppStyled />
      
      {/* Update notification */}
      {isUpdateAvailable && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          left: '16px',
          right: '16px',
          background: '#4f46e5',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '448px',
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          <span>New version available!</span>
          <button 
            onClick={handleRefresh}
            style={{
              background: 'white',
              color: '#4f46e5',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </>
  );
}
