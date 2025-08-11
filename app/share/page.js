'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Share2, Copy, Check, Music, Heart, Users } from 'lucide-react';

// Separate component that uses useSearchParams
const ShareContent = () => {
  const searchParams = useSearchParams();
  const [copied, setCopied] = React.useState(false);
  
  // Get the song data from URL parameters
  const title = searchParams.get('title') || 'Unknown Song';
  const artist = searchParams.get('artist') || 'Unknown Artist';
  const votes = searchParams.get('votes') || '0';
  const suggester = searchParams.get('suggester') || 'Anonymous';
  
  // Generate the share URL (current page URL)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} by ${artist}`,
          text: `Check out this song suggestion from RMC Choir: "${title}" by ${artist}`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        paddingTop: '40px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
          }}>
            <Share2 size={40} color="white" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#4338ca',
            marginBottom: '8px'
          }}>
            Song Shared
          </h1>
          <p style={{
            color: '#6366f1',
            fontSize: '14px'
          }}>
            From RMC Choir Song Wishlist
          </p>
        </div>

        {/* Song Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e7ff',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Music size={24} color="white" />
            </div>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#4338ca',
                marginBottom: '4px'
              }}>
                {title}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6366f1'
              }}>
                by {artist}
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <Heart size={16} style={{ marginRight: '8px', color: '#ec4899' }} />
              <span style={{ fontSize: '14px', color: '#4338ca', fontWeight: '500' }}>
                {votes} {votes === '1' ? 'vote' : 'votes'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <Users size={16} style={{ marginRight: '8px', color: '#6366f1' }} />
              <span style={{ fontSize: '14px', color: '#4338ca' }}>
                Suggested by {suggester}
              </span>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e7ff',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4338ca',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            Share This Song
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Native Share Button (if supported) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleNativeShare}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #6366f1, #2563eb)',
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
                  e.target.style.background = 'linear-gradient(135deg, #4f46e5, #1d4ed8)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #6366f1, #2563eb)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Share2 size={18} />
                Share Song
              </button>
            )}

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: copied ? '#10b981' : 'linear-gradient(135deg, #ec4899, #f43f5e)',
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
                if (!copied) {
                  e.target.style.background = 'linear-gradient(135deg, #db2777, #e11d48)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!copied) {
                  e.target.style.background = 'linear-gradient(135deg, #ec4899, #f43f5e)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff, #dbeafe)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid #e0e7ff'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4338ca',
            marginBottom: '8px'
          }}>
            Join RMC Choir
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6366f1',
            marginBottom: '16px'
          }}>
            Want to suggest songs and vote? Join our song wishlist!
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #6366f1, #2563eb)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #4f46e5, #1d4ed8)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6366f1, #2563eb)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Open RMC Song Wishlist
          </Link>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const ShareLoading = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <div style={{
      background: 'white',
      padding: '40px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e0e7ff',
        borderTop: '4px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: '#6366f1', fontSize: '14px' }}>
        Loading song details...
      </p>
    </div>
  </div>
);

// Main component with Suspense wrapper
const SharePage = () => {
  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Suspense fallback={<ShareLoading />}>
        <ShareContent />
      </Suspense>
    </>
  );
};

export default SharePage;
