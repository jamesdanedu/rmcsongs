'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Music, ArrowLeft } from 'lucide-react';
import { getCachedSongs, getOfflineUser, getPendingActionCount } from '../../utils/offlineStorage';

export default function OfflinePage() {
  const [offlineUser, setOfflineUser] = useState(null);
  const [cachedSongs, setCachedSongs] = useState([]);
  const [pendingActions, setPendingActions] = useState(0);
  const [lastOnline, setLastOnline] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Retrieve offline data
    const user = getOfflineUser();
    const songs = getCachedSongs();
    const actionCount = getPendingActionCount();
    
    setOfflineUser(user);
    setCachedSongs(songs || []);
    setPendingActions(actionCount);
    
    // Get last online timestamp
    const lastOnlineStr = localStorage.getItem('rmc_last_online');
    if (lastOnlineStr) {
      setLastOnline(new Date(parseInt(lastOnlineStr, 10)));
    }
  }, []);

  const handleRetryConnection = () => {
    setIsRetrying(true);
    
    // Try to fetch a simple resource to check connectivity
    fetch('/manifest.json', { 
      method: 'HEAD',
      cache: 'no-store' 
    })
      .then(() => {
        // If successful, we're back online
        window.location.href = '/';
      })
      .catch(() => {
        // Still offline
        setIsRetrying(false);
      });
      
    // Set a timeout to stop the retry indicator if it takes too long
    setTimeout(() => {
      setIsRetrying(false);
    }, 5000);
  };

  const goBack = () => {
    // Use history API to go back if possible
    if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      // Otherwise try to navigate to the home page
      window.location.href = '/';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
      color: '#1f2937'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px'
      }}>
        {/* Header */}
        <header style={{
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fee2e2',
            marginBottom: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <WifiOff size={40} color="#ef4444" />
          </div>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            You're Offline
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#4b5563',
            marginBottom: '16px',
            maxWidth: '380px'
          }}>
            Unable to connect to the RMC Song Wishlist. Please check your internet connection.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button 
              onClick={goBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'white',
                color: '#4f46e5',
                border: '1px solid #e0e7ff',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            
            <button 
              onClick={handleRetryConnection}
              disabled={isRetrying}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'linear-gradient(to right, #4f46e5, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <RefreshCw 
                size={16} 
                style={{
                  animation: isRetrying ? 'spin 1s linear infinite' : 'none'
                }}
              />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </header>

        {/* Offline Status Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#4338ca',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Music size={16} style={{ marginRight: '8px' }} />
            Offline Status
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Logged in as</span>
              <span style={{ color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>
                {offlineUser?.name || 'Not logged in'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Cached songs</span>
              <span style={{ color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>
                {cachedSongs.length}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Pending actions</span>
              <span style={{ 
                color: pendingActions > 0 ? '#4f46e5' : '#1f2937', 
                fontWeight: pendingActions > 0 ? '600' : '500',
                fontSize: '14px'
              }}>
                {pendingActions}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Last online</span>
              <span style={{ color: '#1f2937', fontWeight: '500', fontSize: '14px' }}>
                {lastOnline ? 
                  lastOnline.toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  }) : 
                  'Unknown'
                }
              </span>
            </div>
          </div>
        </div>

        {/* What You Can Do Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#4338ca'
          }}>
            What You Can Do Offline
          </h2>
          
          <ul style={{
            paddingLeft: '28px',
            marginBottom: '0'
          }}>
            {offlineUser ? (
              <>
                <li style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  marginBottom: '8px' 
                }}>
                  View cached songs (might not be the most recent)
                </li>
                <li style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  marginBottom: '8px' 
                }}>
                  Suggest new songs (will be submitted when you're back online)
                </li>
                <li style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  marginBottom: '8px' 
                }}>
                  Vote for songs (votes will be synced when connection is restored)
                </li>
                <li style={{ 
                  color: '#4b5563', 
                  fontSize: '14px' 
                }}>
                  Check rankings based on cached data
                </li>
              </>
            ) : (
              <li style={{ 
                color: '#4b5563', 
                fontSize: '14px' 
              }}>
                You need to log in when online to use offline features
              </li>
            )}
          </ul>
        </div>

        {/* Note */}
        <div style={{
          background: '#eef2ff',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid #c7d2fe'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#4338ca',
            margin: '0'
          }}>
            Note: This app works best with an internet connection. Your changes will be synchronized once you're back online.
          </p>
        </div>
      </div>
    </div>
  );
}
