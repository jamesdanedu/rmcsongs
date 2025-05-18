
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Check, Heart, BarChart3, PlusCircle, Music, Mic, 
  ArrowRight, ListMusic, Users, Star, Search, Youtube,
  ThumbsUp, ThumbsDown, Volume2, ExternalLink, AlertTriangle
} from 'lucide-react';

// Import hooks directly - we'll conditionally use their values, not conditionally call the hooks
import { useAuth } from '../hooks/useAuth';
import { useSongs } from '../hooks/useSongs';
import { useVotes } from '../hooks/useVotes';

// Import utilities
import { extractVideoId } from '../lib/youtube-api';

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
 * TinderCard component for swipable song cards
 */
const TinderCard = ({ song, onSwipe, onCardClick }) => {
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [direction, setDirection] = useState(null);

  // Touch/mouse event handlers
  const handleStart = (clientX) => {
    startXRef.current = clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const handleMouseStart = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleMove = (clientX) => {
    const deltaX = clientX - startXRef.current;
    currentXRef.current = deltaX;
    
    // Calculate rotation (more rotate with more swipe)
    const rotate = deltaX / 10; 
    
    // Threshold for direction indication
    if (deltaX > 50) {
      setDirection('right');
    } else if (deltaX < -50) {
      setDirection('left');
    } else {
      setDirection(null);
    }
    
    setTranslateX(deltaX);
    setRotation(rotate);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);

    // Determine if the swipe should count (threshold)
    const threshold = 100;
    
    if (currentXRef.current > threshold) {
      // Swipe right - upvote
      finishSwipeAnimation(true);
    } else if (currentXRef.current < -threshold) {
      // Swipe left - downvote
      finishSwipeAnimation(false);
    } else {
      // Reset position if not meeting threshold
      resetPosition();
    }
  };

  const finishSwipeAnimation = (isLike) => {
    // Animate the card off-screen
    const screenWidth = window.innerWidth;
    const endX = isLike ? screenWidth : -screenWidth;
    
    setTranslateX(endX);
    setOpacity(0);
    
    // Call the callback after animation
    setTimeout(() => {
      onSwipe(isLike);
    }, 300);
  };

  const resetPosition = () => {
    setTranslateX(0);
    setRotation(0);
    setDirection(null);
  };

  // Function to manually trigger swipe animation
  const triggerSwipe = (isLike) => {
    finishSwipeAnimation(isLike);
  };

  const handleCardClick = (e) => {
    // Only trigger click if not swiping
    if (Math.abs(currentXRef.current) < 10) {
      onCardClick(song);
    }
  };

  // Use thumbnail from YouTube if available
  const youtubeThumbnail = song.youtubeVideoId 
    ? `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`
    : null;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: opacity,
        willChange: 'transform, opacity',
        cursor: 'grab',
        zIndex: 100,
      }}
      onMouseDown={handleMouseStart}
      onTouchStart={handleTouchStart}
      onClick={handleCardClick}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Swipe direction indicators */}
        {direction === 'right' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transform: 'rotate(12deg)',
          }}>
            <ThumbsUp size={22} style={{ marginRight: '6px' }} />
            LIKE
          </div>
        )}
        
        {direction === 'left' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transform: 'rotate(-12deg)',
          }}>
            <ThumbsDown size={22} style={{ marginRight: '6px' }} />
            NOPE
          </div>
        )}
        
        {/* Placeholder thumbnail or album cover */}
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: '#E0E7FF',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {youtubeThumbnail ? (
            <>
              <img 
                src={youtubeThumbnail} 
                alt={song.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
              }}>
                <Youtube size={14} style={{ marginRight: '4px' }} />
                Watch Video
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#4F46E5',
            }}>
              <Music size={48} />
              <p style={{ marginTop: '8px', fontSize: '14px' }}>No thumbnail available</p>
            </div>
          )}
        </div>
        
        {/* Song info */}
        <div style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1F2937' }}>
            {song.title}
          </h3>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#4B5563', 
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Mic size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
            {song.artist}
          </p>
          
          {song.notes && (
            <div style={{
              margin: '12px 0',
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4B5563',
            }}>
              <p style={{ margin: '0' }}>{song.notes}</p>
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            <p style={{ 
              fontSize: '13px', 
              color: '#6B7280', 
              margin: '16px 0 0 0',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Users size={14} style={{ marginRight: '6px' }} />
              Suggested by: {song.suggestedBy}
            </p>
          </div>
        </div>
        
        {/* Bottom action bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          padding: '12px 16px 16px',
          borderTop: '1px solid #F3F4F6',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(false);
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ThumbsDown size={24} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(true);
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: '#D1FAE5',
              color: '#10B981',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ThumbsUp size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced version of the ChoirSongApp component with Supabase integration
 * and localStorage fallback
 */
const ChoirSongApp = () => {
  // State for Supabase connection availability
  const [apiStatus, setApiStatus] = useState({
    available: false,
    checking: true,
    error: null
  });

  // Local state for auth, songs, and votes when Supabase is unavailable
  const [localUser, setLocalUser] = useState(null);
  const [localSongs, setLocalSongs] = useState([]);
  const [localVotes, setLocalVotes] = useState({});
  const [localErrors, setLocalErrors] = useState({
    auth: null,
    songs: null,
    votes: null
  });

  // Always call the hooks, but we may not use their values
  // if we're in localStorage fallback mode
  const authHook = useAuth();
  const songsHook = useSongs(authHook.user);
  const votesHook = useVotes(authHook.user);

  // Check if Supabase API is available
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Supabase credentials not found in environment variables');
          setApiStatus({
            available: false,
            checking: false,
            error: 'Missing Supabase credentials'
          });
          return;
        }
        
        // Try a basic fetch to see if Supabase is reachable
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey
            }
          });
          
          if (response.ok) {
            console.log('Supabase connection successful');
            setApiStatus({
              available: true,
              checking: false,
              error: null
            });
          } else {
            console.warn(`Supabase API error: ${response.status}`);
            setApiStatus({
              available: false,
              checking: false,
              error: `Supabase API error: ${response.status}`
            });
          }
        } catch (err) {
          console.error('Failed to connect to Supabase:', err);
          setApiStatus({
            available: false,
            checking: false,
            error: err.message
          });
        }
      } catch (error) {
        console.error('Failed to check API availability:', error);
        setApiStatus({
          available: false,
          checking: false,
          error: error.message
        });
      }
    };
    
    checkApiAvailability();
  }, []);

  // Load local data from localStorage if Supabase is unavailable
  useEffect(() => {
    if (!apiStatus.checking && !apiStatus.available) {
      console.log('Using localStorage fallback mode');
      
      // Load user
      const storedUser = localStorage.getItem('rmc_choir_user');
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      
      // Load songs
      const storedSongs = localStorage.getItem('rmc_songs');
      if (storedSongs) {
        try {
          setLocalSongs(JSON.parse(storedSongs));
        } catch (e) {
          console.error('Failed to parse stored songs:', e);
        }
      }
      
      // Load votes
      const storedVotes = localStorage.getItem('rmc_votes');
      if (storedVotes) {
        try {
          setLocalVotes(JSON.parse(storedVotes));
        } catch (e) {
          console.error('Failed to parse stored votes:', e);
        }
      }
    }
  }, [apiStatus.checking, apiStatus.available]);

  // Determine which set of functions to use based on API status
  const user = apiStatus.available ? authHook.user : localUser;
  const isLoggedIn = apiStatus.available ? authHook.isLoggedIn : !!localUser;
  const authLoading = apiStatus.available ? authHook.isLoading : false;
  const authError = apiStatus.available ? authHook.error : localErrors.auth;
  
  const songs = apiStatus.available ? songsHook.songs : localSongs;
  const songsLoading = apiStatus.available ? songsHook.isLoading : false;
  const songsError = apiStatus.available ? songsHook.error : localErrors.songs;
  
  const isVoting = apiStatus.available ? votesHook.isVoting : false;
  const voteError = apiStatus.available ? votesHook.error : localErrors.votes;

  // Login function
  const login = async (username) => {
    if (!username.trim()) {
      const errorMsg = 'Please enter your name';
      if (apiStatus.available) {
        // Let the hook handle the error
        return authHook.login(username);
      } else {
        setLocalErrors(prev => ({ ...prev, auth: errorMsg }));
        return false;
      }
    }
    
    if (apiStatus.available) {
      return authHook.login(username);
    } else {
      try {
        // Create a mock user
        const userId = 'local-' + Date.now();
        const userData = { id: userId, name: username.trim() };
        
        setLocalUser(userData);
        localStorage.setItem('rmc_choir_user', JSON.stringify(userData));
        setLocalErrors(prev => ({ ...prev, auth: null }));
        return true;
      } catch (error) {
        console.error('Local login error:', error);
        setLocalErrors(prev => ({ ...prev, auth: 'An error occurred during login' }));
        return false;
      }
    }
  };
  
  // Logout function
  const logout = () => {
    if (apiStatus.available) {
      authHook.logout();
    } else {
      setLocalUser(null);
      localStorage.removeItem('rmc_choir_user');
    }
  };
  
  // Add song function
  const addNewSong = async (songData) => {
    if (!songData.title || !songData.artist || !user) {
      const errorMsg = 'Missing song data or user';
      if (apiStatus.available) {
        return songsHook.addNewSong(songData);
      } else {
        setLocalErrors(prev => ({ ...prev, songs: errorMsg }));
        return false;
      }
    }
    
    if (apiStatus.available) {
      return songsHook.addNewSong(songData);
    } else {
      try {
        const songId = 'local-' + Date.now();
        const newSong = {
          id: songId,
          title: songData.title,
          artist: songData.artist,
          notes: songData.notes,
          youtubeVideoId: songData.youtubeVideoId,
          youtubeTitle: songData.youtubeTitle,
          suggestedBy: localUser.name,
          suggestedById: localUser.id,
          votes: 0,
          voters: [],
          createdAt: new Date().toISOString()
        };
        
        const updatedSongs = [newSong, ...localSongs];
        setLocalSongs(updatedSongs);
        localStorage.setItem('rmc_songs', JSON.stringify(updatedSongs));
        setLocalErrors(prev => ({ ...prev, songs: null }));
        return true;
      } catch (error) {
        console.error('Local add song error:', error);
        setLocalErrors(prev => ({ ...prev, songs: 'Failed to add song' }));
        return false;
      }
    }
  };
  
  // Vote function
  const voteForSong = async (songId) => {
    if (!songId || !user) {
      const errorMsg = 'Missing song ID or user';
      if (apiStatus.available) {
        return votesHook.voteForSong(songId);
      } else {
        setLocalErrors(prev => ({ ...prev, votes: errorMsg }));
        return false;
      }
    }
    
    if (apiStatus.available) {
      return votesHook.voteForSong(songId);
    } else {
      try {
        // Check if user already voted for this song
        const hasVoted = localSongs.some(song => 
          song.id === songId && song.voters && song.voters.includes(localUser.id)
        );
        
        if (hasVoted) {
          setLocalErrors(prev => ({ ...prev, votes: 'You have already voted for this song' }));
          return false;
        }
        
        // Update the song's votes
        const updatedSongs = localSongs.map(song => {
          if (song.id === songId) {
            return {
              ...song,
              votes: (song.votes || 0) + 1,
              voters: [...(song.voters || []), localUser.id]
            };
          }
          return song;
        });
        
        setLocalSongs(updatedSongs);
        localStorage.setItem('rmc_songs', JSON.stringify(updatedSongs));
        
        // Update local votes record
        const updatedVotes = {
          ...localVotes,
          [songId]: true
        };
        setLocalVotes(updatedVotes);
        localStorage.setItem('rmc_votes', JSON.stringify(updatedVotes));
        
        setLocalErrors(prev => ({ ...prev, votes: null }));
        return true;
      } catch (error) {
        console.error('Local vote error:', error);
        setLocalErrors(prev => ({ ...prev, votes: 'Failed to register vote' }));
        return false;
      }
    }
  };
  
  // Get songs that haven't been voted on yet
  const getSongsToVote = () => {
    if (apiStatus.available) {
      return songsHook.getSongsToVote();
    } else {
      if (!localUser) return [];
      return localSongs.filter(song => {
        return !song.voters || !song.voters.includes(localUser.id);
      });
    }
  };
  
  // Get songs sorted by votes
  const getSortedSongs = () => {
    if (apiStatus.available) {
      return songsHook.getSortedSongs();
    } else {
      return [...localSongs].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
  };

  // Local state
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('suggest');
  const [songIndex, setSongIndex] = useState(0);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    youtubeQuery: '',
    notes: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [voteType, setVoteType] = useState('up'); // 'up' or 'down'

  // Effect to check if we need to show empty state for voting
  useEffect(() => {
    if (activeTab === 'vote' && !songsLoading && user) {
      const nonVotedSongs = getSongsToVote();
      setShowEmptyState(nonVotedSongs.length === 0);
      
      // Reset song index if it's out of bounds
      if (nonVotedSongs.length > 0 && songIndex >= nonVotedSongs.length) {
        setSongIndex(0);
      }
    }
  }, [activeTab, songs, user, songIndex, songsLoading]);

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
  
  // Handle login
  const handleLogin = async () => {
    if (username.trim()) {
      const success = await login(username);
      if (success) {
        // User logged in successfully, check active tab and set initial state
        if (activeTab === 'vote') {
          const nonVotedSongs = getSongsToVote();
          setShowEmptyState(nonVotedSongs.length === 0);
        }
      }
    }
  };

  // Search YouTube
  const searchYoutube = () => {
    if (newSong.youtubeQuery.trim()) {
      setIsSearching(true);
      // Mock search results - in a real implementation, this would call the YouTube API
      setTimeout(() => {
        const query = newSong.youtubeQuery;
        setSearchResults([
          { 
            id: 'dQw4w9WgXcQ', // Rick Astley's Never Gonna Give You Up as a test 
            title: `${query} - Official Music Video`, 
            thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
            channelTitle: 'VEVO'
          },
          { 
            id: 'jNQXAC9IVRw', // First YouTube video ever: "Me at the zoo"
            title: `${query} (Live Performance)`, 
            thumbnail: `https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg`,
            channelTitle: 'YouTube History'
          },
          { 
            id: '9bZkp7q19f0', // Gangnam Style
            title: `${query} - Acoustic Cover`, 
            thumbnail: `https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg`,
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
  
  // Add a new song
  const handleAddSong = async () => {
    if (newSong.title && newSong.artist && user) {
      // IMPORTANT: Match the property names expected by addNewSong
      const songData = {
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeVideoId: selectedVideo?.id || null,
        youtubeTitle: selectedVideo?.title || null
      };
      
      try {
        const success = await addNewSong(songData);
        
        if (success) {
          setNewSong({ title: '', artist: '', youtubeQuery: '', notes: '' });
          setSearchResults([]);
          setSelectedVideo(null);
        }
      } catch (err) {
        console.error("Error in handleAddSong:", err);
      }
    }
  };

  // Handle voting for a song
  const handleVote = async (isUpvote) => {
    const nonVotedSongs = getSongsToVote();
    
    if (nonVotedSongs.length > 0 && songIndex < nonVotedSongs.length) {
      const currentSong = nonVotedSongs[songIndex];
      
      // Set vote type for UI feedback
      setVoteType(isUpvote ? 'up' : 'down');
      
      try {
        // Register vote in database
        const success = await voteForSong(currentSong.id);
        
        if (success) {
          // Move to the next song or show empty state if no more
          if (songIndex < nonVotedSongs.length - 1) {
            setSongIndex(prevIndex => prevIndex + 1);
          } else {
            // No more songs to vote on
            setShowEmptyState(true);
            setSongIndex(0);
          }
        }
      } catch (err) {
        console.error("Error in handleVote:", err);
      }
    }
  };

  // Handle YouTube video click from the card
  const handleCardClick = (song) => {
    if (song.youtubeVideoId && isValidYouTubeVideoId(song.youtubeVideoId)) {
      window.open(`https://www.youtube.com/watch?v=${song.youtubeVideoId}`, '_blank');
    }
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
              {/* API Status Banner */}
              {!apiStatus.checking && !apiStatus.available && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#FFFBEB',
                  borderRadius: '8px',
                  borderLeft: '4px solid #F59E0B',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={18} style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Supabase connection unavailable</p>
                    <p style={{ margin: '0', fontSize: '14px' }}>Using local storage fallback. Your data will only be saved on this device.</p>
                    {apiStatus.error && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Error: {apiStatus.error}</p>
                    )}
                  </div>
                </div>
              )}
              
              {authError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '8px',
                  borderLeft: '4px solid #EF4444',
                  color: '#B91C1C'
                }}>
                  {authError}
                </div>
              )}
              
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
                    backgroundColor: '#F9FAFB'
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
                disabled={!username.trim() || authLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  cursor: username.trim() && !authLoading ? 'pointer' : 'not-allowed',
                  background: username.trim() && !authLoading
                    ? 'linear-gradient(to right, #4F46E5, #7E3AF2)' 
                    : '#E5E7EB',
                  color: username.trim() && !authLoading ? 'white' : '#6B7280',
                  boxShadow: username.trim() && !authLoading ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {authLoading ? (
                  <div style={{
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px',
                  }}></div>
                ) : (
                  <ArrowRight size={18} style={{marginRight: '8px'}} />
                )}
                <span>{authLoading ? 'Logging in...' : 'Enter App'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state while songs are being loaded
  if (songsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #F5F7FF, #FFFFFF)'
      }}>
        <div style={{
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          border: '3px solid rgba(79, 70, 229, 0.2)', 
          borderTopColor: '#4F46E5',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px',
        }}></div>
        <p style={{color: '#4F46E5', fontWeight: '500'}}>Loading songs...</p>
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
            
            {/* API Status Badge */}
            {!apiStatus.checking && !apiStatus.available && (
              <div style={{
                background: '#FFFBEB',
                color: '#92400E',
                borderRadius: '9999px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                marginRight: '8px'
              }}>
                <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                Local Mode
              </div>
            )}
            
            <div>
              <button 
                onClick={logout}
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
            <span>Logged in as: <span style={{fontWeight: '500'}}>{user?.name}</span></span>
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
              onClick={() => {
                setActiveTab('vote');
                
                // Check if there are songs to vote on
                const nonVotedSongs = getSongsToVote();
                if (nonVotedSongs.length === 0) {
                  setShowEmptyState(true);
                } else {
                  setShowEmptyState(false);
                  setSongIndex(0); // Reset to first song
                }
              }}
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
      
        {/* API Status Banner - only when in local mode */}
        {!apiStatus.checking && !apiStatus.available && (
          <div style={{
            padding: '12px',
            margin: '0 0 16px 0',
            backgroundColor: '#FFFBEB',
            borderRadius: '8px',
            borderLeft: '4px solid #F59E0B',
            color: '#92400E',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={18} style={{ marginRight: '8px', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Using local storage mode</p>
              <p style={{ margin: '0', fontSize: '14px' }}>Your data is only saved on this device. Set up Supabase in the .env.local file to enable cloud storage.</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div style={{padding: '16px 0'}}>
          {activeTab === 'suggest' && (
            <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              <h2 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
                <PlusCircle size={20} style={{marginRight: '8px', color: '#4F46E5'}} />
                Suggest a New Song
              </h2>
              
              {songsError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '8px',
                  borderLeft: '4px solid #EF4444',
                  color: '#B91C1C'
                }}>
                  {songsError}
                </div>
              )}
              
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
                disabled={!newSong.title || !newSong.artist || songsLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500',
                  cursor: (newSong.title && newSong.artist && !songsLoading) ? 'pointer' : 'not-allowed',
                  background: (newSong.title && newSong.artist && !songsLoading) 
                    ? 'linear-gradient(to right, #4F46E5, #7E3AF2)' 
                    : '#E5E7EB',
                  color: (newSong.title && newSong.artist && !songsLoading) ? 'white' : '#6B7280',
                  boxShadow: (newSong.title && newSong.artist && !songsLoading) ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {songsLoading ? (
                  <div style={{
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '50%', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTopColor: 'white',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px',
                  }}></div>
                ) : (
                  <PlusCircle size={18} style={{marginRight: '8px'}} />
                )}
                <span>{songsLoading ? 'Submitting...' : 'Submit Song'}</span>
              </button>
            </div>
          )}
          
          {activeTab === 'vote' && (
            <div style={{height: '600px', position: 'relative'}}>
              <h2 style={{fontSize: '18px', fontWeight: '600', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
                <Heart size={20} style={{marginRight: '8px', color: '#EC4899'}} />
                Swipe to Vote on Songs
              </h2>
              
              {voteError && (
                <div style={{
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '8px',
                  borderLeft: '4px solid #EF4444',
                  color: '#B91C1C'
                }}>
                  {voteError}
                </div>
              )}
              
              {showEmptyState ? (
                <div style={{
                  background: 'white', 
                  padding: '32px', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 'calc(100% - 50px)', // Account for the header
                }}>
                  <Music size={56} style={{color: '#D1D5DB', marginBottom: '16px'}} />
                  <p style={{color: '#4B5563', fontWeight: '600', fontSize: '18px', margin: '0 0 8px 0'}}>
                    No more songs to vote on!
                  </p>
                  <p style={{color: '#9CA3AF', fontSize: '14px', margin: '0 0 16px 0', maxWidth: '280px'}}>
                    You've voted on all the suggested songs. Check back later or suggest some new ones.
                  </p>
                  <button
                    onClick={() => setActiveTab('suggest')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '500',
                      background: '#4F46E5',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <PlusCircle size={18} style={{marginRight: '8px'}} />
                    <span>Suggest a Song</span>
                  </button>
                </div>
              ) : (
                <div style={{
                  height: 'calc(100% - 50px)', // Account for the header
                  position: 'relative',
                }}>
                  {/* Instructions */}
                  <div style={{
                    textAlign: 'center',
                    padding: '12px',
                    marginBottom: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6B7280',
                  }}>
                    <p style={{margin: '0'}}>
                      Swipe right to like, swipe left to dislike, or tap the song to listen on YouTube
                    </p>
                  </div>
                  
                  {/* Card Stack */}
                  <div style={{
                    height: '500px',
                    position: 'relative',
                    margin: '0 auto',
                  }}>
                    {isVoting && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 101,
                        borderRadius: '12px',
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            width: '30px', 
                            height: '30px', 
                            borderRadius: '50%', 
                            border: '3px solid #EBF0FF', 
                            borderTopColor: '#4F46E5',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '8px',
                          }}></div>
                          <p style={{
                            color: '#4F46E5', 
                            fontWeight: '500',
                            margin: 0
                          }}>
                            Recording your vote
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {getSongsToVote().length > 0 && songIndex < getSongsToVote().length && (
                      <TinderCard
                        key={getSongsToVote()[songIndex].id}
                        song={getSongsToVote()[songIndex]}
                        onSwipe={handleVote}
                        onCardClick={handleCardClick}
                      />
                    )}
                  </div>
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
                    {getSortedSongs().map((song, index) => {
                      const maxVotes = Math.max(...getSortedSongs().map(s => s.votes), 1);
                      const percentage = Math.max((song.votes / maxVotes) * 100, 15);
                      
                      return (
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
                                  width: `${percentage}%`
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
                      );
                    })}
                  </div>
                  
                  <div style={{background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
                    <h3 style={{fontSize: '14px', fontWeight: '500', margin: '0', padding: '16px', borderBottom: '1px solid #F3F4F6', color: '#4B5563'}}>
                      Detailed List
                    </h3>
                    <div style={{maxHeight: '384px', overflowY: 'auto'}}>
                      {getSortedSongs().map((song, index) => (
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
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                {song.title}
                                {song.youtubeVideoId && (
                                  <a 
                                    href={`https://www.youtube.com/watch?v=${song.youtubeVideoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#4F46E5',
                                      marginLeft: '8px',
                                      display: 'inline-flex',
                                    }}
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}
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
                              {song.votes}
                            </div>
                          </div>
                        </div>
                      ))}
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
            onClick={() => {
              setActiveTab('vote');
              
              // Check if there are songs to vote on
              if (!songsLoading && user) {
                const nonVotedSongs = getSongsToVote();
                if (nonVotedSongs.length === 0) {
                  setShowEmptyState(true);
                } else {
                  setShowEmptyState(false);
                  setSongIndex(0); // Reset to first song
                }
              }
            }}
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