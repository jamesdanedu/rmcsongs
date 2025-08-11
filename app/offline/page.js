// app/offline/page.js
'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflinePage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <WifiOff size={40} color="white" />
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '16px'
        }}>
          You&apos;re Offline
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          It looks like you&apos;re not connected to the internet right now. 
          Please check your connection and try again.
        </p>
        
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#dc2626',
            marginBottom: '8px'
          }}>
            What you can do:
          </h3>
          <ul style={{
            color: '#991b1b',
            fontSize: '14px',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ marginBottom: '4px' }}>• Check your Wi-Fi connection</li>
            <li style={{ marginBottom: '4px' }}>• Try switching to mobile data</li>
            <li style={{ marginBottom: '4px' }}>• Refresh the page when you&apos;re back online</li>
          </ul>
        </div>
        
        <button
          onClick={handleRefresh}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </button>
        
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
            <Wifi size={16} style={{ marginRight: '8px', color: '#0ea5e9' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#0369a1' }}>
              Connection Status
            </span>
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: '#0369a1', 
            margin: 0 
          }}>
            RMC Choir Song Wishlist works best with an internet connection. 
            Some features may not be available while offline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
