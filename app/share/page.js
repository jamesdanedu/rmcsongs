'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function ShareHandler() {
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  
  useEffect(() => {
    const handleShare = async () => {
      try {
        // Check if user is logged in
        if (!isLoggedIn) {
          // Redirect to home with a parameter indicating there's shared content
          router.push('/?shared=pending');
          return;
        }
        
        // Get shared data from URL parameters
        const title = searchParams.get('title');
        const text = searchParams.get('text');
        const url = searchParams.get('url');
        
        // Validate shared data
        if (!title && !text && !url) {
          setError('No content was shared');
          setProcessing(false);
          return;
        }
        
        // Process shared content
        // YouTube URL handling example:
        if (url && url.includes('youtube.com')) {
          // Extract video title and ID
          // ...
          
          // Redirect to suggest tab with pre-filled data
          router.push(`/?tab=suggest&title=${encodeURIComponent(title)}&youtube=${encodeURIComponent(url)}`);
          return;
        }
        
        // Default handling - just pass the shared title to the suggest tab
        if (title) {
          router.push(`/?tab=suggest&title=${encodeURIComponent(title)}`);
          return;
        }
        
        // If we reach here, no specific handling was done
        router.push('/?tab=suggest');
      } catch (err) {
        console.error('Error processing shared content:', err);
        setError('Failed to process shared content');
        setProcessing(false);
      }
    };
    
    handleShare();
  }, [isLoggedIn, router, searchParams, user]);
  
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.5rem 1rem',
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  // Loading state
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '2rem',
        height: '2rem',
        border: '0.25rem solid #e5e7eb',
        borderTopColor: '#4f46e5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p>Processing shared content...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
