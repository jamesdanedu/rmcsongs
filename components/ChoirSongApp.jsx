'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Heart, BarChart3, PlusCircle, Music, Mic, ArrowRight, ListMusic, Users, Star, Search, Youtube } from 'lucide-react';

/**
 * Custom Choir Icon component
 */
const ChoirIcon = ({ size = 28, className = '' }) => {
  const musicSize = Math.max(Math.floor(size * 0.4), 12);
  
  return (
    <div style={{position: 'relative', display: 'inline-block', ...className}}>
      <Users size={size} color="#4F46E5" />
      <div style={{position: 'absolute', top: '-6px', right: '-6px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
        <Music size={musicSize} color="#4F46E5" />
      </div>
    </div>
  );
};

/**
 * Enhanced version of the ChoirSongApp component
 */
const ChoirSongApp = () => {
  // Local state for testing
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('suggest');
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    youtubeQuery: '',
    notes: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    // Check for stored username
    const storedUser = localStorage.getItem('rmc_username');
    if (storedUser) {
      setUsername(storedUser);
      setIsLoggedIn(true);
    }
    
    // Check for stored songs
    const storedSongs = localStorage.getItem('rmc_songs');
    if (storedSongs) {
      try {
        setSongs(JSON.parse(storedSongs));
      } catch (e) {
        console.error('Failed to parse stored songs:', e);
      }
    }
    
    // Check for active tab
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

  // Auto-update YouTube search query when title or artist changes
  useEffect(() => {
    // Combine title and artist for the YouTube search query
    let query = '';
    if (newSong.title) query += newSong.title;
    if (newSong.title && newSong.artist) query += ' ';
    if (newSong.artist) query += newSong.artist;
    
    if (query !== newSong.youtubeQuery) {
      setNewSong(prev => ({...prev, youtubeQuery: query}));
    }
  }, [newSong.title, newSong.artist]);
  
  // Mock login
  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('rmc_username', username);
      setIsLoggedIn(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('rmc_username');
    setIsLoggedIn(false);
    setUsername('');
  };
  
  // Mock search YouTube
  const searchYoutube = () => {
    if (newSong.youtubeQuery.trim()) {
      setIsSearching(true);
      // Mock search results - in a real implementation, this would call the YouTube API
      setTimeout(() => {
        const query = newSong.youtubeQuery;
        setSearchResults([
          { 
            id: 'abc123', 
            title: `${query} - Official Music Video`, 
            thumbnail: 'https://via.placeholder.com/120x68',
            channelTitle: 'VEVO'
          },
          { 
            id: 'def456', 
            title: `${query} (Live Performance)`, 
            thumbnail: 'https://via.placeholder.com/120x68',
            channelTitle: 'Music Channel'
          },
          { 
            id: 'ghi789', 
            title: `${query} - Acoustic Cover`, 
            thumbnail: 'https://via.placeholder.com/120x68',
            channelTitle: 'Cover Music'
          },
        ]);
        setIsSearching(false);
      }, 1000);
    }
  };

  // Handle selecting a video from search results
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    // If there's a video title, use it for the song title if the song title is empty
    if (video.title && !newSong.title.trim()) {
      // Clean up the title (remove things like "- Official Video", etc)
      let cleanTitle = video.title;
      const suffixes = [' - Official Music Video', ' - Official Video', ' (Official Video)', ' (Lyric Video)', ' (Live Performance)'];
      
      for (const suffix of suffixes) {
        if (cleanTitle.endsWith(suffix)) {
          cleanTitle = cleanTitle.substring(0, cleanTitle.length - suffix.length);
          break;
        }
      }
      
      setNewSong(prev => ({...prev, title: cleanTitle}));
    }
  };
  
  // Mock add song
  const handleAddSong = () => {
    if (newSong.title && newSong.artist) {
      const songToAdd = {
        id: Date.now(),
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeVideoId: selectedVideo?.id || null,
        youtubeTitle: selectedVideo?.title || null,
        suggestedBy: username,
        votes: 0,
        voters: []
      };
      setSongs([...songs, songToAdd]);
      setNewSong({ title: '', artist: '', youtubeQuery: '', notes: '' });
      setSearchResults([]);
      setSelectedVideo(null);
    }
  };

  // Handle voting
  const handleVote = (songId) => {
    setSongs(songs.map(song => 
      song.id === songId 
        ? { ...song, votes: song.votes + 1, voters: [...song.voters, username] }
        : song
    ));
  };
  
  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', background: 'linear-gradient(to bottom, #F5F7FF, #FFFFFF)'}}>
        <div style={{margin: 'auto', width: '100%', maxWidth: '480px', padding: '24px'}}>
          <div style={{background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
            <div style={{background: 'linear-gradient(to right, #4F46E5, #7E3AF2)', padding: '24px', color: 'white'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{position: 'relative', display: 'inline-block', background: 'white', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                  <Users size={32} color="#4F46E5" />
                  <div style={{position: 'absolute', top: '-6px', right: '-6px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                    <Music size={14} color="#4F46E5" />
                  </div>
                </div>
                <div style={{marginLeft: '16px'}}>
                  <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0'}}>RMC Song Wishlist</h1>
                  <p style={{color: '#C7D2FE', margin: '4px 0 0 0'}}>Share, vote, and discover new songs</p>
                </div>
              </div>
            </div>
            
            <div style={{padding: '24px'}}>
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="username" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
                  <Mic size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
                  Your Name
                </label>
                <input
                  type="text"
                  id="username"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="off"
                  autoCapitalize="words"
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={!username.trim()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  cursor: username.trim() ? 'pointer' : 'not-allowed',
                  background: username.trim() 
                    ? 'linear-gradient(to right, #4F46E5, #7E3AF2)' 
                    : '#E5E7EB',
                  color: username.trim() ? 'white' : '#6B7280',
                  boxShadow: username.trim() ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <ArrowRight size={18} style={{marginRight: '8px'}} />
                <span>Enter App</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom, #F5F7FF, #FFFFFF)', paddingBottom: '80px'}}>
      <div style={{maxWidth: '480px', margin: '0 auto', padding: '0 16px'}}>
        <header style={{
          padding: '16px 0', 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #EBF0FF'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div style={{position: 'relative', display: 'inline-block'}}>
                <Users size={32} color="#4F46E5" />
                <div style={{position: 'absolute', top: '-6px', right: '-6px', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                  <Music size={14} color="#4F46E5" />
                </div>
              </div>
              <h1 style={{fontSize: '20px', fontWeight: 'bold', color: '#4338CA', marginLeft: '8px'}}>RMC Song Wishlist</h1>
            </div>
            <div>
              <button 
                onClick={handleLogout}
                style={{
                  color: '#6B7280',
                  padding: '8px',
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                aria-label="Logout"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <p style={{color: '#4F46E5', fontSize: '14px', display: 'flex', alignItems: 'center', marginTop: '4px'}}>
            <Mic size={14} style={{marginRight: '6px'}} />
            <span>Logged in as: <span style={{fontWeight: '500'}}>{username}</span></span>
          </p>
          
          {/* Tab Navigation */}
          <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500',
                background: activeTab === 'suggest' ? '#4F46E5' : 'white',
                color: activeTab === 'suggest' ? 'white' : '#4B5563',
                boxShadow: activeTab === 'suggest' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('suggest')}
            >
              <PlusCircle size={18} style={{marginRight: '6px'}} />
              <span>Suggest</span>
            </button>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500',
                background: activeTab === 'vote' ? '#4F46E5' : 'white',
                color: activeTab === 'vote' ? 'white' : '#4B5563',
                boxShadow: activeTab === 'vote' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('vote')}
            >
              <Heart size={18} style={{marginRight: '6px'}} />
              <span>Vote</span>
            </button>
            <button
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '500',
                background: activeTab === 'rank' ? '#4F46E5' : 'white',
                color: activeTab === 'rank' ? 'white' : '#4B5563',
                boxShadow: activeTab === 'rank' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('rank')}
            >
              <BarChart3 size={18} style={{marginRight: '6px'}} />
              <span>Rankings</span>
            </button>
          </div>
        </header>
      
        {/* Tab Content */}
        <div style={{padding: '16px 0'}}>
          {activeTab === 'suggest' && (
            <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              <h2 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
                <PlusCircle size={20} style={{marginRight: '8px', color: '#4F46E5'}} />
                Suggest a New Song
              </h2>
              
              {/* Song Title */}
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="songTitle" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
                  <Music size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
                  Song Title
                </label>
                <input
                  type="text"
                  id="songTitle"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#F9FAFB'
                  }}
                  value={newSong.title}
                  onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                  placeholder="Enter song title"
                />
              </div>
              
              {/* Artist/Composer */}
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="artist" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
                  <Mic size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
                  Artist/Composer
                </label>
                <input
                  type="text"
                  id="artist"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#F9FAFB'
                  }}
                  value={newSong.artist}
                  onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                  placeholder="Enter artist or composer"
                />
              </div>
              
              {/* YouTube Search Section */}
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="youtubeQuery" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
                  <Youtube size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
                  Find on YouTube (Optional)
                </label>
                <div style={{display: 'flex'}}>
                  <input
                    type="text"
                    id="youtubeQuery"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #E5E7EB',
                      borderRight: 'none',
                      borderRadius: '8px 0 0 8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.2s',
                      backgroundColor: '#F9FAFB'
                    }}
                    value={newSong.youtubeQuery}
                    onChange={(e) => setNewSong({...newSong, youtubeQuery: e.target.value})}
                    placeholder="Search for a video"
                  />
                  <button
                    onClick={searchYoutube}
                    disabled={!newSong.youtubeQuery.trim() || isSearching}
                    style={{
                      padding: '0 16px',
                      borderRadius: '0 8px 8px 0',
                      border: '1px solid #E5E7EB',
                      borderLeft: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: !newSong.youtubeQuery.trim() || isSearching ? '#F3F4F6' : '#4F46E5',
                      color: !newSong.youtubeQuery.trim() || isSearching ? '#9CA3AF' : 'white',
                      cursor: !newSong.youtubeQuery.trim() || isSearching ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Search size={18} />
                  </button>
                </div>
                
                {isSearching && (
                  <div style={{marginTop: '8px', fontSize: '14px', color: '#4F46E5', display: 'flex', alignItems: 'center'}}>
                    <div style={{
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      border: '2px solid #C7D2FE', 
                      borderTopColor: '#4F46E5',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px',
                    }}></div>
                    Searching...
                  </div>
                )}
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div style={{marginTop: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden'}}>
                    <div style={{padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '14px', fontWeight: '500', color: '#4B5563'}}>
                      Search Results
                    </div>
                    <div>
                      {searchResults.map((result, index) => (
                        <div 
                          key={result.id} 
                          style={{
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: index < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                            background: selectedVideo?.id === result.id ? '#F3F4FF' : 'white',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onClick={() => handleSelectVideo(result)}
                        >
                          <div style={{width: '120px', height: '68px', backgroundColor: '#F3F4F6', marginRight: '12px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden'}}>
                            <img src={result.thumbnail} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          </div>
                          <div style={{flex: 1, minWidth: 0}}>
                            <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: selectedVideo?.id === result.id ? '500' : '400', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                              {result.title}
                            </p>
                            <p style={{margin: 0, fontSize: '12px', color: '#6B7280'}}>
                              {result.channelTitle}
                            </p>
                          </div>
                          {selectedVideo?.id === result.id && (
                            <Check size={18} style={{marginLeft: '8px', color: '#4F46E5'}} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Selected Video Preview */}
                {selectedVideo && !searchResults.length && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#F3F4FF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #C7D2FE'
                  }}>
                    <div style={{width: '100px', height: '56px', backgroundColor: '#E0E7FF', marginRight: '12px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden'}}>
                      <img src={selectedVideo.thumbnail} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500', color: '#4338CA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {selectedVideo.title}
                      </p>
                      <p style={{margin: 0, fontSize: '12px', color: '#6B7280'}}>
                        {selectedVideo.channelTitle}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedVideo(null)} 
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        color: '#6B7280',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Additional Notes */}
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="notes" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
                  <ListMusic size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    minHeight: '100px',
                    resize: 'vertical',
                    backgroundColor: '#F9FAFB'
                  }}
                  value={newSong.notes}
                  onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
                  placeholder="Any additional information"
                  rows="3"
                />
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleAddSong}
                disabled={!newSong.title || !newSong.artist}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  cursor: (newSong.title && newSong.artist) ? 'pointer' : 'not-allowed',
                  background: (newSong.title && newSong.artist) 
                    ? 'linear-gradient(to right, #4F46E5, #7E3AF2)' 
                    : '#E5E7EB',
                  color: (newSong.title && newSong.artist) ? 'white' : '#6B7280',
                  boxShadow: (newSong.title && newSong.artist) ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <PlusCircle size={18} style={{marginRight: '8px'}} />
                <span>Submit Song</span>
              </button>
            </div>
          )}
          
          {activeTab === 'vote' && (
            <div>
              <h2 style={{fontSize: '18px', fontWeight: '600', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
                <Heart size={20} style={{marginRight: '8px', color: '#EC4899'}} />
                Vote for Songs
              </h2>
              
              {songs.length === 0 ? (
                <div style={{background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center'}}>
                  <Music size={48} style={{margin: '0 auto 12px auto', color: '#D1D5DB'}} />
                  <p style={{color: '#4B5563', fontWeight: '500', margin: '0'}}>No songs have been suggested yet.</p>
                  <p style={{color: '#9CA3AF', fontSize: '14px', marginTop: '4px'}}>Be the first to suggest a song!</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  {songs.map(song => {
                    const hasVoted = song.voters.includes(username);
                    
                    return (
                      <div 
                        key={song.id} 
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{padding: '16px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div style={{minWidth: 0, flex: 1}}>
                              <h3 style={{fontSize: '16px', fontWeight: '600', color: '#1F2937', margin: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{song.title}</h3>
                              <p style={{fontSize: '14px', color: '#4B5563', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{song.artist}</p>
                              {song.notes && (
                                <p style={{fontSize: '14px', color: '#6B7280', margin: '8px 0 0 0', paddingTop: '8px', borderTop: '1px solid #F3F4F6'}}>{song.notes}</p>
                              )}
                              {song.youtubeVideoId && (
                                <p style={{fontSize: '13px', color: '#4F46E5', margin: '8px 0 0 0', display: 'flex', alignItems: 'center'}}>
                                  <Youtube size={14} style={{marginRight: '4px'}} />
                                  YouTube link available
                                </p>
                              )}
                              <p style={{fontSize: '12px', color: '#9CA3AF', margin: '8px 0 0 0', display: 'flex', alignItems: 'center'}}>
                                <Mic size={12} style={{marginRight: '4px'}} />
                                Suggested by: {song.suggestedBy}
                              </p>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '16px'}}>
                              <div style={{
                                background: '#F3F4FF', 
                                color: '#4F46E5', 
                                borderRadius: '50%', 
                                height: '36px', 
                                width: '36px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                fontSize: '16px'
                              }}>
                                {song.votes}
                              </div>
                              <button 
                                style={{
                                  marginTop: '8px',
                                  borderRadius: '9999px',
                                  padding: '6px 16px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: 'none',
                                  cursor: hasVoted ? 'not-allowed' : 'pointer',
                                  background: hasVoted
                                    ? '#F3F4F6'
                                    : 'linear-gradient(to right, #4F46E5, #7C3AED)',
                                  color: hasVoted ? '#9CA3AF' : 'white',
                                  boxShadow: hasVoted ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                                }}
                                onClick={() => handleVote(song.id)}
                                disabled={hasVoted}
                              >
                                <Heart size={14} style={{marginRight: '6px'}} fill={hasVoted ? "#9CA3AF" : "white"} />
                                {hasVoted ? 'Voted' : 'Vote'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'rank' && (
            <div>
              <h2 style={{fontSize: '18px', fontWeight: '600', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
                <BarChart3 size={20} style={{marginRight: '8px', color: '#4F46E5'}} />
                Song Rankings
              </h2>
              
              {songs.length === 0 ? (
                <div style={{background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center'}}>
                  <ListMusic size={48} style={{margin: '0 auto 12px auto', color: '#D1D5DB'}} />
                  <p style={{color: '#4B5563', fontWeight: '500', margin: '0'}}>No songs have been suggested yet.</p>
                  <p style={{color: '#9CA3AF', fontSize: '14px', marginTop: '4px'}}>Go to the Suggest tab to add a song!</p>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                  <div style={{background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                    <h3 style={{fontSize: '14px', fontWeight: '500', margin: '0 0 16px 0', color: '#4B5563', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6'}}>Top Songs</h3>
                    {[...songs]
                      .sort((a, b) => b.votes - a.votes)
                      .map((song, index) => (
                        <div key={song.id} style={{marginBottom: '12px'}}>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{
                              fontWeight: 'bold', 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}>
                              {index + 1}
                            </div>
                            <div style={{marginLeft: '12px', flex: 1}}>
                              <div 
                                style={{
                                  height: '40px',
                                  background: 'linear-gradient(to right, #818CF8, #6366F1)',
                                  borderRadius: '8px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  transition: 'all 0.3s',
                                  width: `${Math.max((song.votes / Math.max(...songs.map(s => s.votes), 1)) * 100, 15)}%`
                                }}
                              >
                                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 12px'}}>
                                  <span style={{color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{song.title}</span>
                                  <div style={{
                                    marginLeft: 'auto',
                                    background: 'white',
                                    color: '#4338CA',
                                    borderRadius: '50%',
                                    height: '24px',
                                    width: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}>
                                    {song.votes}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  
                  <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                    <h3 style={{fontSize: '14px', fontWeight: '500', margin: '0', padding: '16px', borderBottom: '1px solid #F3F4F6', color: '#4B5563'}}>
                      Detailed List
                    </h3>
                    <div style={{maxHeight: '384px', overflowY: 'auto'}}>
                      {[...songs]
                        .sort((a, b) => b.votes - a.votes)
                        .map((song, index) => (
                          <div 
                            key={song.id} 
                            style={{
                              padding: '16px',
                              borderBottom: index < songs.length - 1 ? '1px solid #F3F4F6' : 'none',
                              transition: 'background-color 0.2s',
                            }}
                          >
                            <div style={{display: 'flex', alignItems: 'flex-start'}}>
                              <div style={{
                                fontWeight: 'bold', 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                flexShrink: 0,
                                marginRight: '12px'
                              }}>
                                {index + 1}
                              </div>
                              <div style={{minWidth: 0, flex: 1}}>
                                <h4 style={{
                                  fontSize: '16px',
                                  fontWeight: '500',
                                  color: '#1F2937',
                                  margin: '0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {song.title}
                                </h4>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#4B5563',
                                  margin: '4px 0 0 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {song.artist}
                                </p>
                                {song.youtubeVideoId && (
                                  <p style={{fontSize: '13px', color: '#4F46E5', margin: '4px 0 0 0', display: 'flex', alignItems: 'center'}}>
                                    <Youtube size={14} style={{marginRight: '4px'}} />
                                    Has YouTube link
                                  </p>
                                )}
                                {song.notes && (
                                  <p style={{fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0'}}>
                                    {song.notes}
                                  </p>
                                )}
                                <p style={{fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0 0', display: 'flex', alignItems: 'center'}}>
                                  <Mic size={12} style={{marginRight: '4px'}} />
                                  Suggested by: {song.suggestedBy}
                                </p>
                              </div>
                              <div style={{
                                marginLeft: '12px',
                                background: '#F3F4FF',
                                color: '#4338CA',
                                borderRadius: '9999px',
                                padding: '4px 12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}>
                                <Star size={14} style={{marginRight: '4px', color: '#FBBF24'}} />
                                {song.votes} {song.votes === 1 ? 'vote' : 'votes'}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.1)',
        borderTop: '1px solid #E5E7EB',
        zIndex: 10
      }}>
        <div style={{display: 'flex', maxWidth: '480px', margin: '0 auto'}}>
          <button
            style={{
              flex: 1,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: activeTab === 'suggest' ? '#4F46E5' : '#6B7280',
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('suggest')}
          >
            <PlusCircle size={22} />
            <span style={{fontSize: '12px', marginTop: '4px', fontWeight: '500'}}>Suggest</span>
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: activeTab === 'vote' ? '#4F46E5' : '#6B7280',
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('vote')}
          >
            <Heart size={22} />
            <span style={{fontSize: '12px', marginTop: '4px', fontWeight: '500'}}>Vote</span>
          </button>
          <button
            style={{
              flex: 1,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: activeTab === 'rank' ? '#4F46E5' : '#6B7280',
              transition: 'color 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('rank')}
          >
            <BarChart3 size={22} />
            <span style={{fontSize: '12px', marginTop: '4px', fontWeight: '500'}}>Rankings</span>
          </button>
        </div>
      </div>
      
      {/* Add CSS for animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default ChoirSongApp;