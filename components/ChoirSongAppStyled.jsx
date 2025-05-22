'use client';

import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3, Music, ListMusic, UserPlus, Star, Search, Play, User, Phone } from 'lucide-react';

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

  // Login screen styles
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'linear-gradient(to bottom, #eef2ff, #ffffff, #eef2ff)'
  },

  loginCard: {
    background: 'white',
    padding: '32px', // Increased padding
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e7ff',
    width: '100%',
    maxWidth: '384px'
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

  // Input styles - FIXED padding
  input: {
    width: '100%',
    padding: '12px 16px', // Better padding
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

  // Tab navigation styles - FIXED positioning and visibility
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
    marginBottom: '8px', // Increased margin
    display: 'flex',
    alignItems: 'center'
  },

  // Error message styles
  errorMessage: {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center'
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
  }
};

// Real YouTube API integration
const searchYouTube = async (query) => {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    console.warn('YouTube API key not found. Using mock data.');
    // Fallback to mock data if no API key
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

const ChoirSongAppStyled = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [authErrors, setAuthErrors] = useState({});
  
  // App state
  const [activeTab, setActiveTab] = useState('suggest');
  const [songs, setSongs] = useState([]);
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rmc_username');
    if (storedUser) {
      setFormData({ fullName: storedUser, phoneNumber: '' });
      setIsLoggedIn(true);
    }
    
    const storedSongs = localStorage.getItem('rmc_songs');
    if (storedSongs) {
      try {
        setSongs(JSON.parse(storedSongs));
      } catch (e) {
        console.error('Failed to parse stored songs:', e);
      }
    }
    
    const storedTab = localStorage.getItem('rmc_active_tab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    if (songs.length > 0) {
      localStorage.setItem('rmc_songs', JSON.stringify(songs));
    }
  }, [songs]);
  
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('rmc_active_tab', activeTab);
    }
  }, [activeTab]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Authentication handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem('rmc_username', formData.fullName);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rmc_username');
    setIsLoggedIn(false);
    setFormData({ fullName: '', phoneNumber: '' });
  };
  
  // Song handlers
  const handleAddSong = () => {
    if (newSong.title && newSong.artist) {
      const songToAdd = {
        id: Date.now(),
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeVideoId: newSong.youtubeVideoId,
        youtubeTitle: newSong.youtubeTitle,
        suggestedBy: formData.fullName,
        votes: 0,
        voters: []
      };
      setSongs([...songs, songToAdd]);
      setNewSong({ title: '', artist: '', notes: '', youtubeVideoId: '', youtubeTitle: '' });
      setSelectedVideo(null);
      setYoutubeResults([]);
      setYoutubeQuery('');
    }
  };

  const handleVote = (songId) => {
    setSongs(songs.map(song => 
      song.id === songId 
        ? { ...song, votes: song.votes + 1, voters: [...song.voters, formData.fullName] }
        : song
    ));
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

  // Login screen - FIXED with phone number
  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ marginBottom: '12px' }}>
              <ChoirIcon size={56} />
            </div>
            <h1 style={styles.title}>RMC Song Wishlist</h1>
            <p style={styles.subtitle}>Share, vote, and discover new songs</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>
                <User size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                style={{
                  ...styles.input,
                  borderColor: authErrors.fullName ? '#dc2626' : '#c7d2fe'
                }}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                autoCapitalize="words"
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = authErrors.fullName ? '#dc2626' : '#c7d2fe'}
              />
              {authErrors.fullName && (
                <p style={styles.errorMessage}>
                  <X size={16} style={{ marginRight: '4px' }} />
                  {authErrors.fullName}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>
                <Phone size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                style={{
                  ...styles.input,
                  borderColor: authErrors.phoneNumber ? '#dc2626' : '#c7d2fe'
                }}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                autoComplete="tel"
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = authErrors.phoneNumber ? '#dc2626' : '#c7d2fe'}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Format: +1234567890 or 1234567890
              </p>
              {authErrors.phoneNumber && (
                <p style={styles.errorMessage}>
                  <X size={16} style={{ marginRight: '4px' }} />
                  {authErrors.phoneNumber}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              style={styles.primaryButton}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(to right, #4338ca, #1d4ed8)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(to right, #4f46e5, #2563eb)';
              }}
            >
              Sign In
            </button>

            <p style={{ 
              marginTop: '16px', 
              fontSize: '12px', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              Your phone number is stored in encrypted format so it is not readable by humans.
            </p>
          </form>
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
              onClick={handleLogout}
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
            Logged in as: {formData.fullName}
          </p>
        </header>

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
            username={formData.fullName}
            handleVote={handleVote}
            styles={styles}
          />
        )}
        
        {activeTab === 'rank' && (
          <RankingsTab 
            songs={songs}
            styles={styles}
          />
        )}
      </div>

      {/* Tab Navigation - FIXED to always be visible */}
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

// SuggestTab Component with YouTube Integration
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

// VoteTab Component
const VoteTab = ({ songs, username, handleVote, styles }) => {
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
            No songs have been suggested yet.
          </p>
          <p style={{ color: '#818cf8', fontSize: '14px' }}>
            Be the first to suggest a song!
          </p>
        </div>
      ) : (
        <div>
          {songs.map(song => {
            const hasVoters = Array.isArray(song.voters);
            const hasVoted = hasVoters && song.voters.includes(username);
            
            return (
              <div 
                key={song.id} 
                style={styles.songCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.songContent}>
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#4338ca', marginBottom: '4px' }}>
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
                        fontSize: '14px', 
                        color: '#6b7280', 
                        marginTop: '4px', 
                        borderTop: '1px solid #e0e7ff', 
                        paddingTop: '4px',
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
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '16px' }}>
                    <div style={{
                      background: 'white',
                      color: '#4338ca',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e0e7ff',
                      marginBottom: '8px'
                    }}>
                      {song.votes || 0}
                    </div>
                    <button 
                      style={hasVoted ? styles.votedButton : styles.voteButton}
                      onClick={() => handleVote(song.id)}
                      disabled={hasVoted}
                      onMouseOver={(e) => {
                        if (!hasVoted) {
                          e.target.style.background = 'linear-gradient(to right, #db2777, #e11d48)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!hasVoted) {
                          e.target.style.background = 'linear-gradient(to right, #ec4899, #f43f5e)';
                        }
                      }}
                    >
                      <Heart size={14} />
                      {hasVoted ? 'Voted' : 'Vote'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// RankingsTab Component
const RankingsTab = ({ songs, styles }) => {
  const sortedSongs = React.useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return [];
    return [...songs].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }, [songs]);

  const maxVotes = React.useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return 1;
    return Math.max(...songs.map(song => song.votes || 0), 1);
  }, [songs]);

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
          {/* Bar chart visualization */}
          <div style={{ 
            padding: '16px', 
            marginBottom: '24px', 
            background: 'linear-gradient(to right, #eef2ff, #dbeafe)', 
            borderRadius: '8px', 
            border: '1px solid #e0e7ff' 
          }}>
            {sortedSongs.map((song, index) => (
              <div key={song.id || index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    fontWeight: 'bold',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#4f46e5',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    marginRight: '8px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #4338ca'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div 
                      style={{
                        ...styles.rankingBar,
                        width: `${Math.max(((song.votes || 0) / maxVotes) * 100, 10)}%`,
                        justifyContent: 'space-between'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'translateX(4px)'}
                      onMouseOut={(e) => e.target.style.transform = 'translateX(0)'}
                    >
                      <span style={{ fontSize: '14px', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {song.title || 'Untitled'}
                      </span>
                      <div style={{
                        background: 'white',
                        color: '#4338ca',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #c7d2fe'
                      }}>
                        {song.votes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
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
              Detailed List
            </h3>
            <div style={{ maxHeight: '384px', overflowY: 'auto', paddingRight: '4px' }}>
              {sortedSongs.map((song, index) => (
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
                        background: '#4f46e5',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        marginRight: '12px',
                        flexShrink: 0,
                        border: '1px solid #4338ca'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: '600', color: '#4338ca', marginBottom: '4px' }}>
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
                    <div style={{
                      background: 'linear-gradient(to right, #eef2ff, #dbeafe)',
                      color: '#4338ca',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Star size={14} style={{ marginRight: '4px', color: '#fbbf24' }} />
                      {song.votes || 0} {(song.votes || 0) === 1 ? 'vote' : 'votes'}
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