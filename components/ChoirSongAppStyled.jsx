'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3, Music, ListMusic, UserPlus, Star, Search, Play, AlertCircle, RefreshCw } from 'lucide-react';
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

  voteButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #ec4899, #f43f5e)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },

  votedButton: {
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
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },

  // Song card styles
  songCard: {
    border: '1px solid #e0e7ff',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    marginBottom: '16px'
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

  // Retry button style
  retryButton: {
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'linear-gradient(to right, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    marginLeft: '8px'
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

// Helper function to get difficulty color
const getDifficultyColor = (difficulty) => {
  if (difficulty <= 3) return '#10b981'; // Green (Easy)
  if (difficulty <= 6) return '#f59e0b'; // Yellow (Medium) 
  return '#ef4444'; // Red (Hard)
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

// Error Display Component
const ErrorDisplay = ({ error, onRetry, onDismiss }) => {
  if (!error) return null;
  
  return (
    <div style={styles.error}>
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0 }}>{error}</p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={styles.retryButton}
            title="Retry"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              padding: '4px'
            }}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const ChoirSongAppStyled = () => {
  // Use database hooks with improved error handling
  const { user, isLoggedIn, logout, isLoading: authLoading, error: authError, clearError: clearAuthError, forceUpdate } = useAuth();
  const { songs, isLoading: songsLoading, error: songsError, addNewSong, getSortedSongs, loadSongs } = useSongs(user);
  const { voteForSong, isVoting, isVotingForSong, error: voteError, clearError: clearVoteError } = useVotes(user);
  
  // Force re-render state (hack to fix login redirect issue)
  const [localForceRender, setLocalForceRender] = useState(0);
  
  // Debug logging
  console.log('ChoirSongApp render - isLoggedIn:', isLoggedIn, 'user:', user, 'authLoading:', authLoading, 'forceUpdate:', forceUpdate);
  console.log('User has valid ID:', user?.id ? 'YES' : 'NO');
  console.log('Should show main app:', isLoggedIn && user && !authLoading ? 'YES' : 'NO');

  // Add useEffect to track isLoggedIn changes
  useEffect(() => {
    console.log('=== STATE CHANGE ===');
    console.log('isLoggedIn changed to:', isLoggedIn, 'user:', user);
    console.log('authLoading:', authLoading, 'forceUpdate:', forceUpdate);
    if (isLoggedIn && user) {
      console.log('✅ Should now show main app!');
      // Force a re-render after login to ensure UI updates
      setLocalForceRender(prev => prev + 1);
    } else {
      console.log('❌ Still showing login screen');
      console.log('Reasons: isLoggedIn =', isLoggedIn, 'user =', !!user, 'authLoading =', authLoading);
    }
    console.log('===================');
  }, [isLoggedIn, user, authLoading, forceUpdate]);
  
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
  
  // Song handlers with improved error handling
  const handleAddSong = async () => {
    if (!newSong.title?.trim() || !newSong.artist?.trim()) {
      return;
    }
    
    const songData = {
      title: newSong.title.trim(),
      artist: newSong.artist.trim(),
      notes: newSong.notes?.trim() || '',
      youtubeVideoId: newSong.youtubeVideoId || null,
      youtubeTitle: newSong.youtubeTitle || null
    };
    
    const success = await addNewSong(songData);
    if (success) {
      setNewSong({ title: '', artist: '', notes: '', youtubeVideoId: '', youtubeTitle: '' });
      setSelectedVideo(null);
      setYoutubeResults([]);
      setYoutubeQuery('');
    }
  };

  const handleVote = async (songId, voteType = 'up') => {
    if (!songId || isVotingForSong && isVotingForSong(songId)) {
      return;
    }
    
    if (voteType === 'up') {
      const success = await voteForSong(songId);
      if (success) {
        console.log(`Vote successful for song ${songId}`);
      }
    } else {
      // Handle downvote - you'll need to implement addDownvote in useVotes hook
      console.log('Downvote for song:', songId);
    }
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
    console.log('Showing loading screen - authLoading:', authLoading);
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
    console.log('Showing login screen - isLoggedIn:', isLoggedIn, 'user:', user);
    return (
      <div style={styles.pageContainer}>
        <div style={styles.maxWidthContainer}>
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '60px' }}>
            <ChoirIcon size={56} />
            <h1 style={styles.title}>RMC Song Wishlist</h1>
            <p style={styles.subtitle}>Share, vote, and discover new songs</p>
          </div>
          <UserLoginForm />
          <ErrorDisplay 
            error={authError} 
            onDismiss={clearAuthError}
          />
        </div>
      </div>
    );
  }
  
  // Main app content when logged in
  console.log('Showing main app - isLoggedIn:', isLoggedIn, 'user:', user);
  return (
    <div style={styles.pageContainer} data-main-app="true">
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
            {user?.phone_number && (
              <span style={{ fontSize: '12px', color: '#818cf8', marginLeft: '8px' }}>
                • {user.phone_number}
              </span>
            )}
            {user?.is_musician && (
              <span style={{ 
                fontSize: '12px', 
                color: '#10b981', 
                marginLeft: '8px',
                background: '#dcfce7',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '500'
              }}>
                ♪ Musician
              </span>
            )}
          </p>
        </header>

        {/* Error Messages with improved display */}
        <ErrorDisplay 
          error={songsError} 
          onRetry={loadSongs}
          onDismiss={() => {/* Clear songs error */}}
        />
        <ErrorDisplay 
          error={voteError} 
          onDismiss={clearVoteError}
        />

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
            songs={songs} 
            user={user}
            handleVote={handleVote}
            isVoting={isVoting}
            isVotingForSong={isVotingForSong}
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

// VoteTab Component - Tinder Style with Touch Support
const VoteTab = ({ songs, user, handleVote, isVoting, isVotingForSong, isLoading, styles }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [difficultyRatings, setDifficultyRatings] = useState({});
  const [submittingRating, setSubmittingRating] = useState(false);
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Filter songs user hasn't voted on
  const availableSongs = songs ? songs.filter(song => !song.votedByCurrentUser) : [];
  const currentSong = availableSongs[currentSongIndex];
  const remainingSongs = availableSongs.length - currentSongIndex;

  const handleDifficultyRating = async (songId, rating) => {
    if (!user?.is_musician) return;
    
    setSubmittingRating(true);
    try {
      console.log(`Setting difficulty rating for song ${songId}: ${rating}`);
      setDifficultyRatings(prev => ({
        ...prev,
        [songId]: rating
      }));
    } catch (error) {
      console.error('Error submitting difficulty rating:', error);
    }
    setSubmittingRating(false);
  };

  const handleCardAction = async (action) => {
    if (!currentSong || (isVotingForSong && isVotingForSong(currentSong.id))) return;

    if (action === 'like') {
      await handleVote(currentSong.id, 'up');
    } else if (action === 'dislike') {
      await handleVote(currentSong.id, 'down');
    }

    // Move to next song
    setTimeout(() => {
      setCurrentSongIndex(prev => prev + 1);
      setCardOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    setCardOffset({ x: deltaX, y: deltaY * 0.3 });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(cardOffset.x) > 100) {
      if (cardOffset.x > 0) {
        handleCardAction('like');
      } else {
        handleCardAction('dislike');
      }
    } else {
      setCardOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    
    setCardOffset({ x: deltaX, y: deltaY * 0.3 });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(cardOffset.x) > 100) {
      if (cardOffset.x > 0) {
        handleCardAction('like');
      } else {
        handleCardAction('dislike');
      }
    } else {
      setCardOffset({ x: 0, y: 0 });
    }
  };

  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading songs...</div>
      </div>
    );
  }

  if (availableSongs.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <Heart size={48} style={{ color: '#ec4899', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
            You've voted on all available songs!
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            Check back later for new suggestions.
          </p>
        </div>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div style={styles.card}>
        <div style={styles.emptyState}>
          <Heart size={48} style={{ color: '#ec4899', marginBottom: '12px', opacity: 0.7 }} />
          <p style={{ color: '#4f46e5', fontWeight: '500', marginBottom: '4px' }}>
            All done voting!
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            You've seen all the songs.
          </p>
        </div>
      </div>
    );
  }

  const getYouTubeThumbnail = (videoId) => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const swipeOpacity = Math.min(Math.abs(cardOffset.x) / 100, 1);
  const swipeColor = cardOffset.x > 0 ? '#10b981' : '#ef4444';

  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>
        <Heart size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
        Vote for Songs ({remainingSongs} remaining)
      </h2>

      {/* Progress indicator */}
      <div style={{
        width: '100%',
        height: '4px',
        background: '#e5e7eb',
        borderRadius: '2px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${((currentSongIndex) / availableSongs.length) * 100}%`,
          height: '100%',
          background: 'linear-gradient(to right, #ec4899, #f43f5e)',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Swipe indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '0 20px'
      }}>
        <div style={{
          padding: '8px 16px',
          borderRadius: '20px',
          background: cardOffset.x < -50 ? '#ef4444' : '#fee2e2',
          color: cardOffset.x < -50 ? 'white' : '#dc2626',
          fontSize: '14px',
          fontWeight: '500',
          opacity: cardOffset.x < 0 ? swipeOpacity : 0.3,
          transition: 'all 0.2s ease'
        }}>
          👎 Swipe left to skip
        </div>
        <div style={{
          padding: '8px 16px',
          borderRadius: '20px',
          background: cardOffset.x > 50 ? '#10b981' : '#dcfce7',
          color: cardOffset.x > 50 ? 'white' : '#059669',
          fontSize: '14px',
          fontWeight: '500',
          opacity: cardOffset.x > 0 ? swipeOpacity : 0.3,
          transition: 'all 0.2s ease'
        }}>
          👍 Swipe right to like
        </div>
      </div>

      {/* Song Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div
          style={{
            width: '90%',
            maxWidth: '320px',
            height: '450px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e7ff',
            position: 'relative',
            transform: `translate(${cardOffset.x}px, ${cardOffset.y}px) rotate(${cardOffset.x * 0.1}deg)`,
            transition: isDragging ? 'none' : 'all 0.3s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe overlay */}
          {Math.abs(cardOffset.x) > 20 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${swipeColor}${Math.floor(swipeOpacity * 30).toString(16).padStart(2, '0')}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '16px'
            }}>
              <div style={{
                fontSize: '48px',
                transform: `scale(${swipeOpacity})`,
                transition: 'transform 0.2s ease'
              }}>
                {cardOffset.x > 0 ? '👍' : '👎'}
              </div>
            </div>
          )}

          {/* YouTube Thumbnail */}
          {currentSong.youtubeVideoId && (
            <div style={{
              width: '100%',
              height: '200px',
              backgroundImage: `url(${getYouTubeThumbnail(currentSong.youtubeVideoId)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Play size={12} style={{ marginRight: '4px' }} />
                YouTube
              </div>
            </div>
          )}

          {/* Song Info */}
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4338ca',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {currentSong.title || 'Untitled'}
            </h3>
            
            <p style={{
              fontSize: '18px',
              color: '#6366f1',
              marginBottom: '12px'
            }}>
              {currentSong.artist || 'Unknown Artist'}
            </p>

            {currentSong.notes && (
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.4',
                marginBottom: '16px',
                fontStyle: 'italic'
              }}>
                {currentSong.notes}
              </p>
            )}

            {/* YouTube Link */}
            {currentSong.youtubeVideoId && (
              <button
                onClick={() => {
                  const url = `https://www.youtube.com/watch?v=${currentSong.youtubeVideoId}`;
                  window.open(url, '_blank');
                }}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
              >
                <Play size={14} style={{ marginRight: '6px' }} />
                Watch on YouTube
              </button>
            )}

            {/* Difficulty Rating for Musicians */}
            {user?.is_musician && (
              <div style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <label style={{
                  fontSize: '12px',
                  color: '#6366f1',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Difficulty Rating (1-10):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#818cf8' }}>1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={difficultyRatings[currentSong.id] || 5}
                    onChange={(e) => handleDifficultyRating(currentSong.id, parseInt(e.target.value))}
                    disabled={submittingRating}
                    style={{
                      flex: 1,
                      height: '6px',
                      background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)',
                      borderRadius: '3px',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#818cf8' }}>10</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#4f46e5',
                  textAlign: 'center',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  {difficultyRatings[currentSong.id] || 5}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => handleCardAction('dislike')}
          disabled={isVotingForSong && isVotingForSong(currentSong.id)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <X size={24} />
        </button>

        <button
          onClick={() => handleCardAction('like')}
          disabled={isVotingForSong && isVotingForSong(currentSong.id)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <Heart size={24} />
        </button>
      </div>
    </div>
  );
};

// RankingsTab Component with enhanced table view
const RankingsTab = ({ songs, isLoading, styles }) => {
  if (isLoading) {
    return (
      <div style={styles.card}>
        <div style={styles.loading}>Loading rankings...</div>
      </div>
    );
  }

  const maxVotes = React.useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return 1;
    return Math.max(...songs.map(song => song.votes || 0), 1);
  }, [songs]);

  const openYouTubeVideo = (youtubeVideoId) => {
    if (youtubeVideoId) {
      const url = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
      window.open(url, '_blank');
    }
  };

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
          {/* Legend */}
          <div style={{ 
            padding: '12px', 
            marginBottom: '16px', 
            background: 'linear-gradient(to right, #eef2ff, #dbeafe)', 
            borderRadius: '8px', 
            border: '1px solid #e0e7ff',
            fontSize: '12px',
            color: '#4338ca'
          }}>
            <strong>Legend:</strong>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ padding: '2px 4px', background: '#dcfce7', borderRadius: '4px', color: '#16a34a' }}>👍</div>
                <span>Upvotes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ padding: '2px 4px', background: '#fee2e2', borderRadius: '4px', color: '#dc2626' }}>👎</div>
                <span>Downvotes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                <span>Easy (1-3)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <span>Medium (4-6)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                <span>Hard (7-10)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Play size={12} style={{ color: '#f59e0b' }} />
                <span>YouTube link</span>
              </div>
            </div>
          </div>
          
          {/* Rankings Table */}
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            border: '1px solid #e0e7ff',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Table Header */}
            <div style={{
              background: 'linear-gradient(to right, #6366f1, #3b82f6)',
              color: 'white',
              padding: '12px 16px',
              fontWeight: '600',
              fontSize: '14px',
              display: 'grid',
              gridTemplateColumns: '40px 1fr 50px 50px 60px',
              gap: '8px',
              alignItems: 'center'
            }}>
              <div>#</div>
              <div>Song</div>
              <div style={{ textAlign: 'center' }}>👍</div>
              <div style={{ textAlign: 'center' }}>👎</div>
              <div style={{ textAlign: 'center' }}>Diff.</div>
            </div>
            
            {/* Table Rows */}
            {songs.map((song, index) => (
              <div 
                key={song.id || index}
                style={{
                  padding: '16px',
                  borderBottom: index < songs.length - 1 ? '1px solid #e0e7ff' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 50px 50px 60px',
                  gap: '8px',
                  alignItems: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Rank */}
                <div style={{
                  fontWeight: 'bold',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {index + 1}
                </div>
                
                {/* Song Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ 
                      fontWeight: '600', 
                      color: '#4338ca', 
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      {song.title || 'Untitled'}
                    </h4>
                    {song.youtubeVideoId && (
                      <button
                        onClick={() => openYouTubeVideo(song.youtubeVideoId)}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
                        title="Open in YouTube"
                      >
                        <Play size={10} />
                      </button>
                    )}
                  </div>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    margin: '2px 0 0 0'
                  }}>
                    {song.artist || 'Unknown Artist'}
                  </p>
                  {song.notes && (
                    <p style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af', 
                      margin: '4px 0 0 0',
                      fontStyle: 'italic'
                    }}>
                      {song.notes.length > 50 ? song.notes.substring(0, 50) + '...' : song.notes}
                    </p>
                  )}
                </div>
                
                {/* Upvotes */}
                <div style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    padding: '4px 6px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {song.upvotes || song.votes || 0}
                  </div>
                </div>
                
                {/* Downvotes */}
                <div style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '4px 6px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '24px',
                    textAlign: 'center'
                  }}>
                    {song.downvotes || 0}
                  </div>
                </div>
                
                {/* Difficulty */}
                <div style={{ 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {song.avgDifficulty ? (
                    <div style={{
                      background: getDifficultyColor(song.avgDifficulty),
                      color: 'white',
                      padding: '4px 6px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {Math.round(song.avgDifficulty * 10) / 10}
                    </div>
                  ) : (
                    <div style={{
                      color: '#9ca3af',
                      fontSize: '11px',
                      fontStyle: 'italic'
                    }}>
                      N/A
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoirSongAppStyled;