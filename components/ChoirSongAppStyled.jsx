'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3, Music, ListMusic, UserPlus, Star, Search, Play, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    paddingBottom: '100px' // Increased to account for tab navigation
  },
  
  maxWidthContainer: {
    maxWidth: '448px', // md equivalent
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

  upvoteButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  downvoteButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  votingButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: '#e5e7eb',
    color: '#6b7280',
    border: 'none',
    fontSize: '14px',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
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

  // Song card styles
  songCard: {
    border: '1px solid #e0e7ff',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    marginBottom: '16px',
    cursor: 'grab',
    userSelect: 'none',
    position: 'relative'
  },

  songCardDragging: {
    cursor: 'grabbing',
    transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    zIndex: 10
  },

  songContent: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  // Empty state styles
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    borderRadius: '8px',
    border: '1px solid #e0e7ff'
  },

  // Ranking bar styles
  rankingBar: {
    height: '40px',
    background: 'linear-gradient(to right, #818cf8, #60a5fa)',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    color: 'white',
    fontWeight: '500',
    marginBottom: '12px'
  },

  // Swipe indicators
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '8px 16px',
    borderRadius: '20px',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    pointerEvents: 'none',
    zIndex: 2
  },

  swipeIndicatorLeft: {
    left: '16px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: 'white'
  },

  swipeIndicatorRight: {
    right: '16px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white'
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

  // Vote count display styles
  voteCountDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },

  voteCountBadge: {
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    color: '#4338ca',
    padding: '8px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  voteBreakdown: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px'
  },

  upvoteCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#10b981',
    fontWeight: '500'
  },

  downvoteCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#ef4444',
    fontWeight: '500'
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

// SwipeableSongCard Component
const SwipeableSongCard = ({ song, onUpvote, onDownvote, isVoting, styles }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleStart = (clientX) => {
    if (isVoting) return;
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX) => {
    if (!isDragging || isVoting) return;
    const offset = clientX - startX;
    setDragOffset(Math.max(Math.min(offset, 150), -150)); // Limit drag distance
  };

  const handleEnd = () => {
    if (isDragging && !isVoting) {
      // Handle swipe action based on drag distance
      if (dragOffset > 50) {
        // Swipe right - upvote
        onUpvote(song.id);
      } else if (dragOffset < -50) {
        // Swipe left - downvote  
        onDownvote(song.id);
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
    ...styles.songCard,
    ...(isDragging ? styles.songCardDragging : {}),
    transform: `translateX(${dragOffset}px)`,
    cursor: isVoting ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab')
  };

  const leftIndicatorOpacity = Math.max(0, Math.min(1, -dragOffset / 100));
  const rightIndicatorOpacity = Math.max(0, Math.min(1, dragOffset / 100));

  return (
    <div 
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Indicators */}
      <div 
        style={{
          ...styles.swipeIndicator,
          ...styles.swipeIndicatorLeft,
          opacity: leftIndicatorOpacity
        }}
      >
        <ThumbsDown size={16} />
        <span>Downvote</span>
      </div>
      <div 
        style={{
          ...styles.swipeIndicator,
          ...styles.swipeIndicatorRight,
          opacity: rightIndicatorOpacity
        }}
      >
        <ThumbsUp size={16} />
        <span>Upvote</span>
      </div>

      <div style={styles.songContent}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: '600', color: '#4338ca', marginBottom: '4px', fontSize: '16px' }}>
            {song.title || 'Untitled'}
          </h3>
          <p style={{ fontSize: '14px', color: '#4f46e5', marginBottom: '4px' }}>
            {song.artist || 'Unknown Artist'}
          </p>
          {song.youtubeTitle && (
            <p style={{ 
              fontSize: '12px', 
              color: '#f59e0b', 
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Play size={12} style={{ marginRight: '4px' }} />
              YouTube: {song.youtubeTitle}
            </p>
          )}
          {song.notes && (
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              marginTop: '8px', 
              borderTop: '1px solid #e0e7ff', 
              paddingTop: '8px',
              fontStyle: 'italic'
            }}>
              {song.notes}
            </p>
          )}
          <p style={{ 
            fontSize: '12px', 
            color: '#818cf8', 
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Mic size={12} style={{ marginRight: '4px' }} />
            Suggested by: {song.suggestedBy || 'Unknown'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '16px', gap: '8px', minWidth: '120px' }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            Swipe or tap to vote
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              style={isVoting ? styles.votingButton : styles.upvoteButton}
              onClick={(e) => {
                e.stopPropagation();
                if (!isVoting) onUpvote(song.id);
              }}
              disabled={isVoting}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #10b981, #059669)';
                }
              }}
            >
              <ThumbsUp size={14} />
            </button>
            <button 
              style={isVoting ? styles.votingButton : styles.downvoteButton}
              onClick={(e) => {
                e.stopPropagation();
                if (!isVoting) onDownvote(song.id);
              }}
              disabled={isVoting}
              onMouseOver={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                }
              }}
              onMouseOut={(e) => {
                if (!isVoting) {
                  e.target.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
                }
              }}
            >
              <ThumbsDown size={14} />
            </button>
          </div>
          {isVoting && (
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Voting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChoirSongAppStyled = () => {
  // Use database hooks instead of local state
  const { user, isLoggedIn, logout, isLoading: authLoading, error: authError } = useAuth();
  const { songs, pendingSongs, isLoading: songsLoading, error: songsError, addNewSong, getSortedSongs } = useSongs(user);
  const { voteForSong, upvoteForSong, downvoteForSong, isVoting, error: voteError } = useVotes(user);
  
  // App state
  const [activeTab, setActiveTab] = useState('suggest');
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

  // Updated voting handlers
  const handleUpvote = async (songId) => {
    console.log('Upvoting song:', songId);
    await upvoteForSong(songId);
  };

  const handleDownvote = async (songId) => {
    console.log('Downvoting song:', songId);
    await downvoteForSong(songId);
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
          />
        )}
        
        {activeTab === 'vote' && (
          <VoteTab
            songs={pendingSongs}
            user={user}
            handleUpvote={handleUpvote}
            handleDownvote={handleDownvote}
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

// SuggestTab Component
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
  styles 
}) => {
  const isValid = newSong?.title?.trim() && newSong?.artist?.trim();
  
  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>
        <PlusCircle size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
        Suggest a New Song
      </h2>
      
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
          Artist/Composer
        </label>
        <input
          type="text"
          style={styles.input}
          value={newSong?.artist || ''}
          onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
          placeholder="Enter artist or composer"
          onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
          onBlur={(e) => e.target.style.borderColor = '#c7d2fe'}
        />
      </div>

      {/* YouTube Search Section */}
      <div style={styles.youtubeSearchContainer}>
        <label style={styles.label}>
          <Play size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
          Search YouTube (Optional)
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            style={{...styles.input, flex: 1}}
            value={youtubeQuery}
            onChange={(e) => setYoutubeQuery(e.target.value)}
            placeholder="Auto-filled from title and artist"
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
        disabled={!isValid}
        style={isValid ? styles.primaryButton : styles.disabledButton}
        onMouseOver={(e) => {
          if (isValid) {
            e.target.style.background = 'linear-gradient(to right, #4338ca, #1d4ed8)';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (isValid) {
            e.target.style.background = 'linear-gradient(to right, #4f46e5, #2563eb)';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        <PlusCircle size={18} />
        Submit Song
      </button>
    </div>
  );
};

// VoteTab Component - Updated for swipeable cards
const VoteTab = ({ songs, user, handleUpvote, handleDownvote, isVoting, isLoading, styles }) => {
  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading songs...</div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>
        <Heart size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
        Vote for Songs
      </h2>
      
      {!Array.isArray(songs) || songs.length === 0 ? (
        <div style={styles.emptyState}>
          <Music size={48} style={{ color: '#a5b4fc', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
            No more songs to vote on!
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            You've voted on all available songs. New songs will appear here when suggested.
          </p>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #e0e7ff'
          }}>
            <p style={{ fontSize: '14px', color: '#4338ca', fontWeight: '500', marginBottom: '4px' }}>
              💡 Swipe right to upvote, left to downvote
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Or use the buttons below each song
            </p>
          </div>
          {songs.map(song => (
            <SwipeableSongCard 
              key={song.id}
              song={song}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              isVoting={isVoting}
              styles={styles}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// RankingsTab Component - Updated to show upvote/downvote counts
const RankingsTab = ({ songs, isLoading, styles }) => {
  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading rankings...</div>
      </div>
    );
  }

  return (
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
        <div>
          {/* Detailed list */}
          <div style={{ 
            background: 'linear-gradient(to right, #eef2ff, #dbeafe)', 
            borderRadius: '8px', 
            padding: '16px', 
            border: '1px solid #e0e7ff' 
          }}>
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ListMusic size={16} style={{ marginRight: '4px' }} />
              Song Rankings ({songs.length} total)
            </h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
              {songs.map((song, index) => (
                <div 
                  key={song.id || index} 
                  style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0e7ff',
                    transition: 'all 0.2s ease',
                    marginBottom: '16px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <div style={{
                        fontWeight: 'bold',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: index < 3 ? '#fbbf24' : '#4f46e5',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        marginRight: '12px',
                        flexShrink: 0,
                        border: index < 3 ? '1px solid #f59e0b' : '1px solid #4338ca'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: '600', color: '#4338ca', marginBottom: '4px', fontSize: '16px' }}>
                          {song.title || 'Untitled'}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#4f46e5', marginBottom: '4px' }}>
                          {song.artist || 'Unknown Artist'}
                        </p>
                        {song.youtubeTitle && (
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#f59e0b', 
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <Play size={12} style={{ marginRight: '4px' }} />
                            {song.youtubeTitle}
                          </p>
                        )}
                        <p style={{ 
                          fontSize: '12px', 
                          color: '#818cf8', 
                          display: 'flex', 
                          alignItems: 'center',
                          marginBottom: '0'
                        }}>
                          <Mic size={12} style={{ marginRight: '4px' }} />
                          Suggested by: {song.suggestedBy || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div style={styles.voteCountDisplay}>
                      <div style={styles.voteCountBadge}>
                        <Star size={14} style={{ marginRight: '4px', color: '#fbbf24' }} />
                        {song.netVotes || 0} net
                      </div>
                      <div style={styles.voteBreakdown}>
                        <div style={styles.upvoteCount}>
                          <ThumbsUp size={12} />
                          {song.upvotes || 0}
                        </div>
                        <div style={styles.downvoteCount}>
                          <ThumbsDown size={12} />
                          {song.downvotes || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {song.notes && (
                    <div style={{
                      marginTop: '12px',
                      fontSize: '14px',
                      color: '#6b7280',
                      borderTop: '1px solid #e0e7ff',
                      paddingTop: '8px',
                      fontStyle: 'italic'
                    }}>
                      {song.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoirSongAppStyled;