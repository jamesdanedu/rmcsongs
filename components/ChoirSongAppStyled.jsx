'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3, Music, ListMusic, UserPlus, Star, Search, Play, ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSongs } from '../hooks/useSongs';
import { useVotes } from '../hooks/useVotes';
import UserLoginForm from './UserLoginForm';

// CSS-in-JS styles to ensure they work regardless of Tailwind issues
const styles = {
  // Main container styles
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)',
    paddingBottom: '100px'
  },
  
  maxWidthContainer: {
    maxWidth: '448px',
    margin: '0 auto',
    padding: '0 16px'
  },

  // Header styles
  header: {
    padding: '16px 0',
    marginBottom: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'linear-gradient(to bottom, #eef2ff, #dbeafe)',
    backdropFilter: 'blur(8px)'
  },

  headerCard: {
    background: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #e0e7ff',
    transition: 'all 0.3s ease'
  },

  // Card styles
  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e7ff',
    transition: 'all 0.3s ease',
    marginBottom: '16px'
  },

  // Single song card for vote tab
  singleSongCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e0e7ff',
    overflow: 'hidden',
    marginBottom: '24px',
    cursor: 'grab',
    userSelect: 'none',
    position: 'relative',
    transition: 'all 0.3s ease'
  },

  singleSongCardDragging: {
    cursor: 'grabbing',
    transform: 'scale(1.02)',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.2)',
    zIndex: 10
  },

  // YouTube thumbnail area
  thumbnailContainer: {
    position: 'relative',
    height: '200px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden'
  },

  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  thumbnailPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: 'white'
  },

  playOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease'
  },

  playButton: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer'
  },

  // Song content area
  songInfo: {
    padding: '20px'
  },

  songTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
    lineHeight: '1.2'
  },

  songArtist: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '12px'
  },

  songNotes: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: '16px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    borderLeft: '3px solid #e0e7ff'
  },

  // Difficulty slider for musicians
  difficultySection: {
    marginBottom: '20px',
    padding: '16px',
    background: 'linear-gradient(to right, #fef3c7, #fed7aa)',
    borderRadius: '8px',
    border: '1px solid #f59e0b'
  },

  difficultyLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },

  difficultySlider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#e5e7eb',
    outline: 'none',
    cursor: 'pointer'
  },

  difficultyValue: {
    textAlign: 'center',
    marginTop: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#92400e'
  },

  // Voting controls
  votingControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px'
  },

  skipButton: {
    padding: '12px',
    borderRadius: '50%',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },

  downvoteButton: {
    padding: '16px 24px',
    borderRadius: '50px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '120px',
    justifyContent: 'center'
  },

  upvoteButton: {
    padding: '16px 24px',
    borderRadius: '50px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '120px',
    justifyContent: 'center'
  },

  votingButton: {
    padding: '16px 24px',
    borderRadius: '50px',
    background: '#e5e7eb',
    color: '#6b7280',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '120px',
    justifyContent: 'center'
  },

  // Progress indicator
  progressIndicator: {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '12px',
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    borderRadius: '8px',
    border: '1px solid #e0e7ff'
  },

  progressText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4338ca'
  },

  // Swipe indicators for single card
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '12px 20px',
    borderRadius: '25px',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    pointerEvents: 'none',
    zIndex: 5
  },

  swipeIndicatorLeft: {
    left: '20px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: 'white'
  },

  swipeIndicatorRight: {
    right: '20px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white'
  },

  // Table styles for rankings - More Compact
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontSize: '13px'
  },

  tableHeader: {
    background: 'linear-gradient(to right, #4f46e5, #6366f1)',
    color: 'white'
  },

  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },

  tableRowHover: {
    backgroundColor: '#f9fafb'
  },

  tableCell: {
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '13px',
    lineHeight: '1.3'
  },

  tableCellHeader: {
    padding: '12px 8px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600'
  },

  tableCellCenter: {
    padding: '8px 6px',
    textAlign: 'center',
    fontSize: '13px'
  },

  tableCellCenterHeader: {
    padding: '12px 6px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600'
  },

  // Compact rank badge
  rankBadge: {
    fontWeight: 'bold',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    margin: '0 auto'
  },

  // Input styles
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #c7d2fe',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },

  // Button styles
  primaryButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #4f46e5, #2563eb)',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  secondaryButton: {
    padding: '8px 12px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #6366f1, #3b82f6)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  disabledButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#d1d5db',
    color: '#6b7280',
    border: 'none',
    fontSize: '16px',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  },

  // Tab navigation styles
  tabNavigation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80px',
    background: 'white',
    boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderTop: '1px solid #e0e7ff',
    zIndex: 50,
    display: 'flex'
  },

  tabContainer: {
    display: 'flex',
    width: '100%',
    maxWidth: '448px',
    margin: '0 auto'
  },

  tab: {
    flex: 1,
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#6b7280',
    fontSize: '12px'
  },

  activeTab: {
    flex: 1,
    padding: '8px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#4f46e5',
    transform: 'scale(1.05)',
    transition: 'all 0.2s ease',
    fontSize: '12px',
    fontWeight: '500'
  },

  // Text styles
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: '4px',
    textAlign: 'center'
  },

  subtitle: {
    fontSize: '14px',
    color: '#818cf8',
    textAlign: 'center'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    color: '#4338ca'
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },

  // Loading styles
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#6b7280'
  },

  // Error styles
  error: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    margin: '16px 0',
    fontSize: '14px'
  },

  // Empty state styles
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    borderRadius: '8px',
    border: '1px solid #e0e7ff'
  },

  // YouTube search styles
  youtubeSearchContainer: {
    marginTop: '12px',
    padding: '16px',
    background: 'white',
    border: '1px solid #e0e7ff',
    borderRadius: '8px'
  },

  youtubeResult: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: '1px solid #e0e7ff',
    borderRadius: '8px',
    background: 'white',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  selectedYoutubeResult: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    background: '#eef2ff',
    marginBottom: '8px'
  },

  // YouTube player modal
  playerModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  playerContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto'
  },

  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  playerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },

  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    color: '#6b7280'
  }
};

// Real YouTube API integration
const searchYouTube = async (query) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    console.warn('YouTube API key not found. Using mock data.');
    return [
      {
        id: `mock-${Date.now()}-1`,
        title: `${query} - Official Video`,
        channelTitle: 'Official Channel',
        thumbnails: { default: { url: '/api/placeholder/120/90' } }
      },
      {
        id: `mock-${Date.now()}-2`, 
        title: `${query} (Lyrics)`,
        channelTitle: 'Lyrics Channel',
        thumbnails: { default: { url: '/api/placeholder/120/90' } }
      }
    ];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(query)}&type=video&part=snippet&maxResults=5`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items?.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnails: item.snippet.thumbnails
    })) || [];
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
};

// ChoirIcon Component
const ChoirIcon = ({ size = 28 }) => {
  const musicSize = Math.max(Math.floor(size * 0.4), 12);
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #2563eb)',
        borderRadius: '50%',
        padding: '4px'
      }}>
        <UserPlus size={size} color="white" />
      </div>
      <div style={{
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        background: 'white',
        borderRadius: '50%',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e7ff'
      }}>
        <Music size={musicSize} color="#4f46e5" />
      </div>
    </div>
  );
};

// YouTube Player Modal Component
const YouTubePlayerModal = ({ videoId, title, isOpen, onClose }) => {
  if (!isOpen || !videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div style={styles.playerModal} onClick={onClose}>
      <div style={styles.playerContainer} onClick={(e) => e.stopPropagation()}>
        <div style={styles.playerHeader}>
          <h3 style={styles.playerTitle}>{title}</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

// Single Song Vote Card Component
const SingleSongVoteCard = ({ song, onUpvote, onDownvote, onSkip, isVoting, isMusician, styles }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [difficulty, setDifficulty] = useState(5);
  const [showPlayer, setShowPlayer] = useState(false);

  const handleStart = (clientX) => {
    if (isVoting) return;
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX) => {
    if (!isDragging || isVoting) return;
    const offset = clientX - startX;
    setDragOffset(Math.max(Math.min(offset, 150), -150));
  };

  const handleEnd = () => {
    if (isDragging && !isVoting) {
      if (dragOffset > 30) {  // Reduced from 50 to 30 for more sensitivity
        // Swipe right - upvote
        onUpvote(song.id, isMusician ? difficulty : null);
      } else if (dragOffset < -30) {  // Reduced from -50 to -30
        // Swipe left - downvote  
        onDownvote(song.id, isMusician ? difficulty : null);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    handleEnd();
  };

  // Touch events for mobile
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const cardStyle = {
    ...styles.singleSongCard,
    ...(isDragging ? styles.singleSongCardDragging : {}),
    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
    cursor: isVoting ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab')
  };

  const leftIndicatorOpacity = Math.max(0, Math.min(1, -dragOffset / 100));
  const rightIndicatorOpacity = Math.max(0, Math.min(1, dragOffset / 100));

  const getThumbnailUrl = (videoId) => {
    if (!videoId) return null;
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleThumbnailClick = () => {
    if (song.youtubeVideoId) {
      setShowPlayer(true);
    }
  };

  return (
    <>
      <div 
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Enhanced Swipe Instructions */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          ← Swipe to vote →
        </div>
        {/* Enhanced Swipe Indicators - More Visible */}
        <div 
          style={{
            ...styles.swipeIndicator,
            ...styles.swipeIndicatorLeft,
            opacity: leftIndicatorOpacity,
            transform: `translateY(-50%) scale(${1 + leftIndicatorOpacity * 0.2})`
          }}
        >
          <ThumbsDown size={24} />
          <span style={{ fontWeight: 'bold' }}>DOWNVOTE</span>
        </div>
        <div 
          style={{
            ...styles.swipeIndicator,
            ...styles.swipeIndicatorRight,
            opacity: rightIndicatorOpacity,
            transform: `translateY(-50%) scale(${1 + rightIndicatorOpacity * 0.2})`
          }}
        >
          <ThumbsUp size={24} />
          <span style={{ fontWeight: 'bold' }}>UPVOTE</span>
        </div>

        {/* YouTube Thumbnail */}
        <div 
          style={styles.thumbnailContainer}
          onClick={handleThumbnailClick}
          onMouseOver={(e) => {
            const overlay = e.currentTarget.querySelector('.play-overlay');
            if (overlay) overlay.style.opacity = '1';
          }}
          onMouseOut={(e) => {
            const overlay = e.currentTarget.querySelector('.play-overlay');
            if (overlay) overlay.style.opacity = '0';
          }}
        >
          {song.youtubeVideoId ? (
            <>
              <img 
                src={getThumbnailUrl(song.youtubeVideoId)}
                alt="YouTube thumbnail"
                style={styles.thumbnailImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div style={styles.thumbnailPlaceholder} className="thumbnail-fallback" hidden>
                <Music size={48} />
                <span style={{ fontSize: '16px', fontWeight: '500' }}>
                  {song.title}
                </span>
              </div>
              <div className="play-overlay" style={styles.playOverlay}>
                <button style={styles.playButton}>
                  <Play size={24} color="#4f46e5" />
                </button>
              </div>
            </>
          ) : (
            <div style={styles.thumbnailPlaceholder}>
              <Music size={48} />
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                {song.title}
              </span>
            </div>
          )}
        </div>

        {/* Song Information */}
        <div style={styles.songInfo}>
          <h2 style={styles.songTitle}>{song.title}</h2>
          <p style={styles.songArtist}>{song.artist}</p>
          
          {song.notes && (
            <div style={styles.songNotes}>
              {song.notes}
            </div>
          )}

          {/* Difficulty Slider for Musicians */}
          {isMusician && (
            <div style={styles.difficultySection}>
              <div style={styles.difficultyLabel}>
                <Star size={16} style={{ marginRight: '4px' }} />
                Rate Difficulty
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                style={styles.difficultySlider}
              />
              <div style={styles.difficultyValue}>
                {difficulty}/10
              </div>
            </div>
          )}

          {/* Voting Controls */}
          <div style={styles.votingControls}>
            <button
              style={styles.skipButton}
              onClick={() => onSkip(song.id)}
              disabled={isVoting}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.background = '#e5e7eb';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.background = '#f3f4f6';
                }
              }}
            >
              <SkipForward size={20} color="#6b7280" />
            </button>

            <button 
              style={isVoting ? styles.votingButton : styles.downvoteButton}
              onClick={() => {
                if (!isVoting) onDownvote(song.id, isMusician ? difficulty : null);
              }}
              disabled={isVoting}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <ThumbsDown size={18} />
              {isVoting ? 'Voting...' : 'Downvote'}
            </button>

            <button 
              style={isVoting ? styles.votingButton : styles.upvoteButton}
              onClick={() => {
                if (!isVoting) onUpvote(song.id, isMusician ? difficulty : null);
              }}
              disabled={isVoting}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #10b981, #059669)';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              <ThumbsUp size={18} />
              {isVoting ? 'Voting...' : 'Upvote'}
            </button>
          </div>
        </div>
      </div>

      <YouTubePlayerModal
        videoId={song.youtubeVideoId}
        title={`${song.title} - ${song.artist}`}
        isOpen={showPlayer}
        onClose={() => setShowPlayer(false)}
      />
    </>
  );
};

const ChoirSongAppStyled = () => {
  // Use database hooks instead of local state
  const { user, isLoggedIn, logout, isLoading: authLoading, error: authError } = useAuth();
  const { songs, pendingSongs, isLoading: songsLoading, error: songsError, addNewSong, getSortedSongs } = useSongs(user);
  const { voteForSong, upvoteForSong, downvoteForSong, isVoting, error: voteError } = useVotes(user);
  
  // App state
  const [activeTab, setActiveTab] = useState('suggest');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    notes: '',
    youtubeVideoId: '',
    youtubeTitle: ''
  });

  // YouTube search state
  const [youtubeQuery, setYoutubeQuery] = useState('');
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchingYouTube, setSearchingYouTube] = useState(false);

  // Auto-populate YouTube search when title and artist change
  useEffect(() => {
    if (newSong.title && newSong.artist) {
      setYoutubeQuery(`${newSong.title} ${newSong.artist}`);
    }
  }, [newSong.title, newSong.artist]);

  // Load active tab from localStorage
  useEffect(() => {
    const storedTab = localStorage.getItem('rmc_active_tab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);
  
  // Save active tab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('rmc_active_tab', activeTab);
    }
  }, [activeTab]);

  // Reset current song index when switching to vote tab or songs change
  useEffect(() => {
    if (activeTab === 'vote') {
      setCurrentSongIndex(0);
    }
  }, [activeTab, pendingSongs]);
  
  // Song handlers - now using database
  const handleAddSong = async () => {
    if (newSong.title && newSong.artist) {
      const songData = {
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeVideoId: newSong.youtubeVideoId,
        youtubeTitle: newSong.youtubeTitle
      };
      
      const success = await addNewSong(songData);
      if (success) {
        setNewSong({ title: '', artist: '', notes: '', youtubeVideoId: '', youtubeTitle: '' });
        setSelectedVideo(null);
        setYoutubeResults([]);
        setYoutubeQuery('');
      }
    }
  };

  // Updated voting handlers with difficulty
  const handleUpvote = async (songId, difficulty = null) => {
    console.log('Upvoting song:', songId, 'Difficulty:', difficulty);
    await upvoteForSong(songId, difficulty);
    setCurrentSongIndex(prev => prev + 1);
  };

  const handleDownvote = async (songId, difficulty = null) => {
    console.log('Downvoting song:', songId, 'Difficulty:', difficulty);
    await downvoteForSong(songId, difficulty);
    setCurrentSongIndex(prev => prev + 1);
  };

  const handleSkip = async (songId) => {
    console.log('Skipping song:', songId);
    // Just move to next song without voting
    setCurrentSongIndex(prev => prev + 1);
  };

  // YouTube search handlers
  const handleYouTubeSearch = async () => {
    if (!youtubeQuery.trim()) return;
    
    setSearchingYouTube(true);
    try {
      const results = await searchYouTube(youtubeQuery);
      setYoutubeResults(results);
    } catch (error) {
      console.error('YouTube search error:', error);
    }
    setSearchingYouTube(false);
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setNewSong({
      ...newSong,
      youtubeVideoId: video.id,
      youtubeTitle: video.title
    });
  };

  // Show loading screen during auth check
  if (authLoading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <ChoirIcon size={56} />
            <p style={{ marginTop: '16px' }}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.maxWidthContainer}>
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '60px' }}>
            <ChoirIcon size={56} />
            <h1 style={styles.title}>RMC Song Wishlist</h1>
            <p style={styles.subtitle}>Share, vote, and discover new songs</p>
          </div>
          <UserLoginForm />
          {authError && (
            <div style={styles.error}>
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Main app content when logged in
  return (
    <div style={styles.pageContainer}>
      <div style={styles.maxWidthContainer}>
        {/* Header */}
        <header style={styles.header}>
          <div 
            style={styles.headerCard}
            onMouseOver={(e) => e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ChoirIcon size={24} />
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#4338ca', marginLeft: '8px', margin: 0 }}>
                RMC Song Wishlist
              </h1>
            </div>
            <button 
              onClick={logout}
              style={{
                color: '#4f46e5',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.color = '#4338ca'}
              onMouseOut={(e) => e.target.style.color = '#4f46e5'}
            >
              <span style={{ marginRight: '4px' }}>Logout</span>
              <X size={16} />
            </button>
          </div>
          
          <p style={{
            color: '#4f46e5',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '4px 0 0 0'
          }}>
            <Mic size={14} style={{ marginRight: '4px' }} />
            Logged in as: {user?.name || user?.fullName}
          </p>
        </header>

        {/* Error Messages */}
        {songsError && <div style={styles.error}>{songsError}</div>}
        {voteError && <div style={styles.error}>{voteError}</div>}

        {/* Tab Content */}
        {activeTab === 'suggest' && (
          <SuggestTab 
            newSong={newSong} 
            setNewSong={setNewSong} 
            handleAddSong={handleAddSong}
            youtubeQuery={youtubeQuery}
            setYoutubeQuery={setYoutubeQuery}
            youtubeResults={youtubeResults}
            selectedVideo={selectedVideo}
            searchingYouTube={searchingYouTube}
            handleYouTubeSearch={handleYouTubeSearch}
            handleSelectVideo={handleSelectVideo}
            styles={styles}
            user={user}
            songs={songs}
          />
        )}
        
        {activeTab === 'vote' && (
          <VoteTab
            songs={pendingSongs}
            currentSongIndex={currentSongIndex}
            user={user}
            handleUpvote={handleUpvote}
            handleDownvote={handleDownvote}
            handleSkip={handleSkip}
            isVoting={isVoting}
            isLoading={songsLoading}
            styles={styles}
          />
        )}
        
        {activeTab === 'rank' && (
          <RankingsTab 
            songs={getSortedSongs()}
            isLoading={songsLoading}
            styles={styles}
          />
        )}
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNavigation}>
        <div style={styles.tabContainer}>
          <button
            style={activeTab === 'suggest' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('suggest')}
          >
            <div style={activeTab === 'suggest' ? {
              background: '#eef2ff',
              padding: '8px',
              borderRadius: '50%',
              marginBottom: '4px'
            } : { marginBottom: '4px' }}>
              <PlusCircle 
                size={20} 
                color={activeTab === 'suggest' ? '#4f46e5' : '#6b7280'} 
              />
            </div>
            <span>Suggest</span>
          </button>

          <button
            style={activeTab === 'vote' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('vote')}
          >
            <div style={activeTab === 'vote' ? {
              background: '#eef2ff',
              padding: '8px',
              borderRadius: '50%',
              marginBottom: '4px'
            } : { marginBottom: '4px' }}>
              <Heart 
                size={20} 
                color={activeTab === 'vote' ? '#4f46e5' : '#6b7280'} 
              />
            </div>
            <span>Vote</span>
          </button>

          <button
            style={activeTab === 'rank' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('rank')}
          >
            <div style={activeTab === 'rank' ? {
              background: '#eef2ff',
              padding: '8px',
              borderRadius: '50%',
              marginBottom: '4px'
            } : { marginBottom: '4px' }}>
              <BarChart3 
                size={20} 
                color={activeTab === 'rank' ? '#4f46e5' : '#6b7280'} 
              />
            </div>
            <span>Rankings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// SuggestTab Component with 30-day limit
const SuggestTab = ({ 
  newSong, 
  setNewSong, 
  handleAddSong,
  youtubeQuery,
  setYoutubeQuery,
  youtubeResults,
  selectedVideo,
  searchingYouTube,
  handleYouTubeSearch,
  handleSelectVideo,
  styles,
  user,
  songs 
}) => {
  const isValid = newSong?.title?.trim() && newSong?.artist?.trim();
  
  // Calculate recent suggestions (last 30 days)
  const getRecentSuggestionsCount = () => {
    if (!user || !songs) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return songs.filter(song => {
      const songDate = new Date(song.createdAt);
      return song.suggestedById === user.id && songDate >= thirtyDaysAgo;
    }).length;
  };
  
  const recentSuggestions = getRecentSuggestionsCount();
  const remainingSuggestions = Math.max(0, 5 - recentSuggestions);
  const canSuggest = remainingSuggestions > 0;
  
  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>
        <PlusCircle size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
        Suggest a New Song
      </h2>
      
      {/* Suggestion Limit Info */}
      <div style={{
        padding: '12px',
        marginBottom: '16px',
        background: canSuggest 
          ? 'linear-gradient(to right, #eef2ff, #dbeafe)' 
          : 'linear-gradient(to right, #fef2f2, #fecaca)',
        borderRadius: '8px',
        border: `1px solid ${canSuggest ? '#e0e7ff' : '#fecaca'}`
      }}>
        <p style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: canSuggest ? '#4338ca' : '#dc2626',
          marginBottom: '4px'
        }}>
          {canSuggest 
            ? `${remainingSuggestions} suggestion${remainingSuggestions !== 1 ? 's' : ''} remaining` 
            : 'Suggestion limit reached'
          }
        </p>
        <p style={{ 
          fontSize: '12px', 
          color: canSuggest ? '#6b7280' : '#991b1b'
        }}>
          {canSuggest 
            ? 'You can suggest up to 5 songs every 30 days'
            : 'You\'ve reached your limit of 5 suggestions per 30 days. Try again later!'
          }
        </p>
      </div>

      {!canSuggest && (
        <div style={styles.emptyState}>
          <PlusCircle size={48} style={{ color: '#fca5a5', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#dc2626', fontWeight: '500', marginBottom: '4px' }}>
            Suggestion limit reached
          </p>
          <p style={{ color: '#991b1b', fontSize: '14px' }}>
            You can suggest more songs after your 30-day window resets.
          </p>
        </div>
      )}

      {canSuggest && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
              <Music size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Song Title
            </label>
            <input
              type="text"
              style={styles.input}
              value={newSong?.title || ''}
              onChange={(e) => setNewSong({...newSong, title: e.target.value})}
              placeholder="Enter song title"
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#c7d2fe'}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
              <Mic size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Artist
            </label>
            <input
              type="text"
              style={styles.input}
              value={newSong?.artist || ''}
              onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
              placeholder="Enter artist"
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#c7d2fe'}
            />
          </div>

          {/* YouTube Search Section */}
          <div style={styles.youtubeSearchContainer}>
            <label style={styles.label}>
              <Play size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Link to YouTube Video 
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                style={{...styles.input, flex: 1}}
                value={youtubeQuery}
                onChange={(e) => setYoutubeQuery(e.target.value)}
                placeholder="Auto-filled from above"
                onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSearch()}
              />
              <button
                onClick={handleYouTubeSearch}
                disabled={searchingYouTube || !youtubeQuery.trim()}
                style={styles.secondaryButton}
              >
                <Search size={16} />
                {searchingYouTube ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* YouTube Results */}
            {youtubeResults.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                  Select a video:
                </p>
                {youtubeResults.map((video) => (
                  <div
                    key={video.id}
                    style={selectedVideo?.id === video.id ? styles.selectedYoutubeResult : styles.youtubeResult}
                    onClick={() => handleSelectVideo(video)}
                    onMouseOver={(e) => {
                      if (selectedVideo?.id !== video.id) {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedVideo?.id !== video.id) {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    <img 
                      src={video.thumbnails?.default?.url || '/api/placeholder/80/60'} 
                      alt="Video thumbnail" 
                      style={{ width: '80px', height: '60px', borderRadius: '4px', marginRight: '12px' }}
                    />
                    <div>
                      <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px', color: '#374151' }}>
                        {video.title}
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>
                        {video.channelTitle}
                      </p>
                    </div>
                    {selectedVideo?.id === video.id && (
                      <div style={{ marginLeft: 'auto' }}>
                        <div style={{
                          background: '#4f46e5',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected Video Display */}
            {selectedVideo && (
              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: '#eef2ff', 
                border: '1px solid #4f46e5', 
                borderRadius: '8px' 
              }}>
                <p style={{ fontSize: '12px', color: '#4f46e5', marginBottom: '4px' }}>
                  ✓ Selected Video:
                </p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#4338ca' }}>
                  {selectedVideo.title}
                </p>
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>
              <ListMusic size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Additional Notes (Optional)
            </label>
            <textarea
              style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
              value={newSong?.notes || ''}
              onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
              placeholder="Any additional information"
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = '#c7d2fe'}
            />
          </div>
          
          <button
            onClick={handleAddSong}
            disabled={!isValid || !canSuggest}
            style={(isValid && canSuggest) ? styles.primaryButton : styles.disabledButton}
            onMouseOver={(e) => {
              if (isValid && canSuggest) {
                e.target.style.background = 'linear-gradient(to right, #4338ca, #1d4ed8)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (isValid && canSuggest) {
                e.target.style.background = 'linear-gradient(to right, #4f46e5, #2563eb)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <PlusCircle size={18} />
            {canSuggest ? 'Submit Song' : 'Limit Reached'}
          </button>
        </>
      )}
    </div>
  );
};

// VoteTab Component - Single Song Display
const VoteTab = ({ songs, currentSongIndex, user, handleUpvote, handleDownvote, handleSkip, isVoting, isLoading, styles }) => {
  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading songs...</div>
      </div>
    );
  }

  const remainingSongs = songs?.length - currentSongIndex || 0;
  const currentSong = songs?.[currentSongIndex];

  if (!Array.isArray(songs) || songs.length === 0) {
    return (
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Heart size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
          Vote for Songs
        </h2>
        <div style={styles.emptyState}>
          <Music size={48} style={{ color: '#a5b4fc', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
            No more songs to vote on!
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            You've voted on all available songs. New songs will appear here when suggested.
          </p>
        </div>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <Heart size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
          Vote for Songs
        </h2>
        <div style={styles.emptyState}>
          <Heart size={48} style={{ color: '#a5b4fc', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
            All done! 🎉
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            You've voted on all available songs. Check back later for new submissions!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>
        <Heart size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
        Vote for Songs
      </h2>
      
      {/* Progress Indicator */}
      <div style={styles.progressIndicator}>
        <p style={styles.progressText}>
          {remainingSongs} song{remainingSongs !== 1 ? 's' : ''} left to vote on
        </p>
      </div>

      {/* Single Song Card */}
      <SingleSongVoteCard
        song={currentSong}
        onUpvote={handleUpvote}
        onDownvote={handleDownvote}
        onSkip={handleSkip}
        isVoting={isVoting}
        isMusician={user?.is_musician || false}
        styles={styles}
      />
    </div>
  );
};

// RankingsTab Component - Compact Table with Icon Headers
const RankingsTab = ({ songs, isLoading, styles }) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading rankings...</div>
      </div>
    );
  }

  const handleRowClick = (song) => {
    if (song.youtubeVideoId) {
      setSelectedSong(song);
      setShowPlayer(true);
    }
  };

  // Sort by upvotes first, then by lowest difficulty (if available)
  const sortedSongs = [...(songs || [])].sort((a, b) => {
    // First sort by upvotes (descending) - ensure we have numbers
    const aUpvotes = parseInt(a.upvotes) || 0;
    const bUpvotes = parseInt(b.upvotes) || 0;
    
    if (bUpvotes !== aUpvotes) {
      return bUpvotes - aUpvotes;
    }
    
    // If upvotes are equal, sort by difficulty (ascending - easier first)
    const aDiff = parseFloat(a.averageDifficulty);
    const bDiff = parseFloat(b.averageDifficulty);
    
    // If both have difficulty ratings
    if (!isNaN(aDiff) && !isNaN(bDiff)) {
      return aDiff - bDiff;
    }
    
    // If only one has difficulty rating, prioritize the one with rating
    if (!isNaN(aDiff) && isNaN(bDiff)) return -1;
    if (isNaN(aDiff) && !isNaN(bDiff)) return 1;
    
    // If neither has difficulty rating, maintain current order
    return 0;
  });

  return (
    <>
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          <BarChart3 size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
          Song Rankings
        </h2>
        
        {!Array.isArray(songs) || songs.length === 0 ? (
          <div style={styles.emptyState}>
            <ListMusic size={48} style={{ color: '#a5b4fc', marginBottom: '12px', opacity: 0.7 }} />
            <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
              No songs have been suggested yet.
            </p>
            <p style={{ color: '#818cf8', fontSize: '14px' }}>
              Go to the Suggest tab to add a song!
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={{ ...styles.tableCellCenterHeader, width: '40px' }}>#</th>
                  <th style={styles.tableCellHeader}>Song</th>
                  <th style={{ ...styles.tableCellCenterHeader, width: '50px' }}>
                    <ThumbsUp size={14} title="Upvotes" />
                  </th>
                  <th style={{ ...styles.tableCellCenterHeader, width: '50px' }}>
                    <ThumbsDown size={14} title="Downvotes" />
                  </th>
                  <th style={{ ...styles.tableCellCenterHeader, width: '60px' }}>
                    <Star size={14} title="Difficulty" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSongs.map((song, index) => (
                  <tr 
                    key={song.id || index}
                    style={styles.tableRow}
                    onClick={() => handleRowClick(song)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      if (song.youtubeVideoId) {
                        e.currentTarget.style.cursor = 'pointer';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <td style={styles.tableCellCenter}>
                      <div style={{
                        ...styles.rankBadge,
                        background: index < 3 ? '#fbbf24' : '#4f46e5',
                        color: 'white'
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                        {song.title || 'Untitled'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {song.artist || 'Unknown Artist'}
                      </div>
                      {song.youtubeVideoId && (
                        <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                          <Play size={8} style={{ marginRight: '2px' }} />
                          Click to play
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCellCenter}>
                      <div style={{
                        color: '#10b981',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {parseInt(song.upvotes) || 0}
                      </div>
                    </td>
                    <td style={styles.tableCellCenter}>
                      <div style={{
                        color: '#ef4444',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {parseInt(song.downvotes) || 0}
                      </div>
                    </td>
                    <td style={styles.tableCellCenter}>
                      {song.averageDifficulty && !isNaN(parseFloat(song.averageDifficulty)) ? (
                        <div style={{
                          color: '#f59e0b',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          {parseFloat(song.averageDifficulty).toFixed(1)}
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>NR</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <YouTubePlayerModal
        videoId={selectedSong?.youtubeVideoId}
        title={selectedSong ? `${selectedSong.title} - ${selectedSong.artist}` : ''}
        isOpen={showPlayer}
        onClose={() => {
          setShowPlayer(false);
          setSelectedSong(null);
        }}
      />
    </>
  );
};

export default ChoirSongAppStyled;