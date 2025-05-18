'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Heart, BarChart3, PlusCircle, Music, Mic, ArrowRight, 
  ListMusic, Users, Star, Search, Youtube, ExternalLink } from 'lucide-react';
import { extractVideoId, isValidYouTubeVideoId, getYouTubeThumbnail } from '../lib/youtube-api';
// Import Supabase functions
import { supabaseClient, getUserByName, createUser, fetchAllSongs, addSong, fetchVotesForSong, addVote } from '../lib/supabase';

/**
 * Custom Choir Icon component
 */
const ChoirIcon = ({ size = 28, className = '' }) => {
  // Scale the music note size relative to the main icon size
  const musicSize = Math.max(Math.floor(size * 0.4), 12);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <Users size={size} className="text-indigo-600" />
      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-md">
        <Music size={musicSize} className="text-indigo-600" />
      </div>
    </div>
  );
};

/**
 * YouTube Search component - shows search results inline
 */
const YouTubeSearchResults = ({ searchQuery, onSelectVideo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Function to handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedVideo(null);
    
    // Use YouTube API
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      setError('YouTube API key not configured.');
      setIsLoading(false);
      return;
    }
    
    // Make the actual YouTube API call - limit to 3 results
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=3&key=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`YouTube API returned ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          const formattedResults = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url || `https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
            channelTitle: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
          }));
          setSearchResults(formattedResults);
        } else {
          setError('No videos found.');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error searching YouTube:', err);
        setError(`Search failed: ${err.message}`);
        setIsLoading(false);
      });
  };

  // Run search on mount
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery]);

  // Handle select video
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    // Delay before sending back to parent
    setTimeout(() => {
      onSelectVideo(video);
    }, 500);
  };

  // Handle opening YouTube video in new tab
  const handleOpenVideoInYouTube = (videoUrl, e) => {
    e.stopPropagation();
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="mb-4">
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-indigo-600 text-sm">Searching videos...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500 text-sm">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && searchResults.length === 0 && (
        <div className="text-center py-4 text-indigo-600 text-sm">
          <p>No videos found. Try searching with different terms.</p>
        </div>
      )}

      {!isLoading && !error && searchResults.length > 0 && !selectedVideo && (
        <div className="space-y-3 mt-3">
          <p className="text-sm text-gray-600 mb-3">
            Select a video to include with your song:
          </p>
          {searchResults.map((video) => (
            <div
              key={video.id}
              className="border rounded-lg overflow-hidden flex cursor-pointer transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50"
              onClick={() => handleSelectVideo(video)}
            >
              <div className="w-32 h-20 flex-shrink-0 relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover cursor-pointer"
                />
                <button
                  onClick={(e) => handleOpenVideoInYouTube(video.url, e)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all"
                >
                  <div className="bg-red-600 text-white rounded-full p-1.5 opacity-0 hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} />
                  </div>
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col">
                <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
                <p className="text-xs text-gray-500 mt-auto">{video.channelTitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div className="border border-indigo-200 rounded-lg overflow-hidden mt-3">
          <div className="flex items-center">
            <div 
              className="w-24 h-16 flex-shrink-0 cursor-pointer relative"
              onClick={() => handleOpenVideoInYouTube(selectedVideo.url, { stopPropagation: () => {} })}
            >
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all">
                <div className="opacity-0 hover:opacity-100 transition-opacity">
                  <Youtube size={24} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="p-2 flex-1">
              <p className="text-sm line-clamp-2">{selectedVideo.title}</p>
            </div>
            <div className="pr-2 flex gap-1">
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  onSelectVideo(null);
                }}
                className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced version of the ChoirSongApp component
 */
const ChoirSongApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null); // Store the full user object including ID
  const [activeTab, setActiveTab] = useState('suggest');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    notes: '',
    youtubeVideoId: '',
    youtubeTitle: '',
    youtubeUrl: ''
  });
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Load data and set up Supabase subscription
  useEffect(() => {
    // Check for logged in status from session
    const checkUserSession = async () => {
      try {
        // Check if we have an active session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          // We have a session, but we still need the username
          const user = await getUserByName(session.user.id);
          if (user) {
            setUsername(user.name);
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    
    // Check if we have a user stored in the app state already
    if (username && isLoggedIn) {
      fetchSongsFromSupabase();
      
      // Set up realtime subscriptions
      const songsSubscription = supabaseClient
        .channel('songs_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'songs' }, 
          () => {
            console.log('Songs table changed, refreshing data...');
            fetchSongsFromSupabase();
          }
        )
        .subscribe();
        
      const votesSubscription = supabaseClient
        .channel('votes_channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'votes' }, 
          () => {
            console.log('Votes table changed, refreshing data...');
            fetchSongsFromSupabase();
          }
        )
        .subscribe();
      
      // Cleanup subscriptions
      return () => {
        supabaseClient.removeChannel(songsSubscription);
        supabaseClient.removeChannel(votesSubscription);
      };
    } else {
      // Check if we have a stored session
      checkUserSession();
    }
  }, [isLoggedIn, username]);
  
  // Fetch songs from Supabase
  const fetchSongsFromSupabase = async () => {
    try {
      console.log('Fetching songs from Supabase...');
      
      // Call Supabase to fetch songs
      const songsData = await fetchAllSongs();
      console.log('Songs data from Supabase:', songsData);
      
      if (!songsData || songsData.length === 0) {
        console.log('No songs found in database');
        setSongs([]);
        return;
      }
      
      // Map the songs data to the expected format
      const formattedSongs = songsData.map(song => {
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          notes: song.notes,
          youtubeVideoId: song.youtube_video_id,
          youtubeTitle: song.youtube_title,
          youtubeUrl: song.youtube_url || (song.youtube_video_id ? `https://www.youtube.com/watch?v=${song.youtube_video_id}` : ''),
          suggestedBy: song.suggesterName || 'Unknown',
          suggestedById: song.suggested_by,
          votes: song.votes_count || 0,
          voters: song.voters || [],
          // If we have a logged-in user, check if they've voted
          votedByCurrentUser: user ? (song.voter_ids || []).includes(user.id) : false,
          createdAt: song.created_at
        };
      });
      
      console.log('Processed songs with votes:', formattedSongs);
      setSongs(formattedSongs);
    } catch (err) {
      console.error('Error fetching songs from Supabase:', err);
      // Set empty array for songs
      setSongs([]);
    }
  };
  
  // Save active tab preference
  useEffect(() => {
    if (activeTab) {
      console.log('Setting active tab:', activeTab);
    }
  }, [activeTab]);
  
  // Handle login
  const handleLogin = async () => {
    if (username.trim()) {
      try {
        setLoading(true);
        console.log('Attempting login with username:', username);
        
        // Check if user exists in Supabase
        let userData;
        try {
          userData = await getUserByName(username.trim());
          console.log('User data from Supabase:', userData);
        } catch (userError) {
          console.error('Error checking for existing user:', userError);
          // Continue to user creation
        }
        
        // Create a new user if they don't exist
        if (!userData) {
          console.log('Creating new user with name:', username.trim());
          try {
            userData = await createUser(username.trim());
            console.log('New user created:', userData);
          } catch (createError) {
            console.error('Error creating user:', createError);
            throw new Error(`Failed to create user: ${createError.message || 'Unknown error'}`);
          }
        }
        
        if (!userData || !userData.id) {
          throw new Error('Failed to get or create user - no user data returned');
        }
        
        // Store user ID for later use
        console.log('Setting logged in state with user ID:', userData.id);
        setUser(userData);
        setUsername(userData.name);
        setIsLoggedIn(true);
        
        // After login, fetch songs
        await fetchSongsFromSupabase();
      } catch (err) {
        console.error('Login error:', err);
        alert(`Login failed: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out user');
    setIsLoggedIn(false);
    setUsername('');
    setUser(null);
    setSongs([]);
  };
  
  // Open YouTube search
  const handleOpenYouTubeSearch = () => {
    setShowYouTubeSearch(true);
  };

  // Clear YouTube selection
  const handleClearYouTubeVideo = () => {
    setNewSong({
      ...newSong,
      youtubeVideoId: '',
      youtubeTitle: '',
      youtubeUrl: ''
    });
    setShowYouTubeSearch(false);
  };
  
  // Preview YouTube video or open in new tab
  const handlePreviewYouTubeVideo = (videoId, title, openInNewTab = false) => {
    if (openInNewTab) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    } else {
      setPreviewVideo({ id: videoId, title });
    }
  };

  // Close YouTube video preview
  const handleCloseVideoPreview = () => {
    setPreviewVideo(null);
  };
  
  // Add a new song
  const handleAddSong = async () => {
    if (newSong.title && newSong.artist) {
      try {
        setLoading(true);
        console.log('Adding new song to Supabase...');
        
        // Ensure we have a user ID
        if (!user || !user.id) {
          throw new Error('User not found. Please log in again.');
        }
        
        // Create song data for Supabase
        // IMPORTANT: Only include fields that exist in your DB schema
        const songData = {
          title: newSong.title,
          artist: newSong.artist,
          notes: newSong.notes || null,
          youtube_video_id: newSong.youtubeVideoId || null,
          youtube_title: newSong.youtubeTitle || null,
          suggested_by: user.id // Use the actual user ID from Supabase
        };
        
        console.log('Song data being sent to Supabase:', songData);
        
        // Add the song to Supabase
        const newSongData = await addSong(songData);
        console.log('Song added successfully:', newSongData);
        
        // Reset form
        setNewSong({ 
          title: '', 
          artist: '', 
          notes: '',
          youtubeVideoId: '',
          youtubeTitle: '',
          youtubeUrl: ''
        });
        setShowYouTubeSearch(false);
        
        // Refresh songs list from Supabase
        await fetchSongsFromSupabase();
        
        // Show success message
        alert('Song added successfully!');
      } catch (err) {
        console.error('Error adding song:', err);
        alert(`Failed to add song: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle voting for a song
  const handleVote = async (songId) => {
    try {
      setLoading(true);
      console.log(`Voting for song ID: ${songId}`);
      
      // Ensure we have a user ID
      if (!user || !user.id) {
        throw new Error('User not found. Please log in again.');
      }
      
      console.log(`Adding vote with user ID: ${user.id}`);
      
      // Add vote to Supabase
      await addVote(songId, user.id);
      console.log('Vote added successfully');
      
      // Refresh songs list to get updated vote counts
      await fetchSongsFromSupabase();
    } catch (err) {
      // Check if error is due to unique constraint (already voted)
      if (err.code === '23505') {
        console.log('Duplicate vote error:', err);
        alert('You have already voted for this song');
      } else {
        console.error('Error voting for song:', err);
        alert(`Failed to vote: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border border-indigo-100">
          <div className="text-center mb-6">
            <ChoirIcon size={56} className="mx-auto" />
            <h1 className="text-2xl font-bold text-indigo-700 mb-1 mt-3">RMC Song Wishlist</h1>
            <p className="text-indigo-400 text-sm">Share, vote, and discover new songs</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Mic size={16} className="mr-1 text-indigo-500" />
              Your Name
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
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
            className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
              !username.trim() 
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
            }`}
          >
            <ArrowRight size={18} className="mr-1" />
            <span>Enter App</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full pb-8">
      <div className="max-w-md mx-auto px-4">
        <header className="py-4 mb-4 sticky top-0 z-10 bg-gradient-to-b from-indigo-50 to-blue-100 backdrop-blur-sm">
          <div className="bg-white p-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <ChoirIcon size={24} />
              <h1 className="text-xl font-bold text-indigo-700 ml-2">RMC Song Wishlist</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <span className="sr-only md:not-sr-only md:inline">Logout</span>
                <X size={16} className="ml-1" />
              </button>
            </div>
          </div>
          
          <p className="text-indigo-600 text-sm text-center mt-1 flex items-center justify-center">
            <Mic size={14} className="mr-1" />
            <span>Logged in as: {username}</span>
          </p>
        </header>

        {/* Tab Navigation - Fixed to bottom for mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-indigo-100 z-10">
          <div className="flex max-w-md mx-auto">
            <button
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
                activeTab === 'suggest' 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-indigo-500'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('suggest')}
            >
              <PlusCircle size={20} />
              <span className="text-xs mt-1">Suggest</span>
            </button>
            <button
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
                activeTab === 'vote' 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-indigo-500'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('vote')}
            >
              <Heart size={20} />
              <span className="text-xs mt-1">Vote</span>
            </button>
            <button
              className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
                activeTab === 'rank' 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-indigo-500'
              } transition-colors duration-200`}
              onClick={() => setActiveTab('rank')}
            >
              <BarChart3 size={20} />
              <span className="text-xs mt-1">Rankings</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'suggest' && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-700">
              <PlusCircle size={20} className="mr-2 text-indigo-500" />
              Suggest a New Song
            </h2>
            
            <div className="mb-4">
              <label htmlFor="songTitle" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Music size={16} className="mr-1 text-indigo-500" />
                Song Title
              </label>
              <input
                type="text"
                id="songTitle"
                className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                placeholder="Enter song title"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mic size={16} className="mr-1 text-indigo-500" />
                Artist/Composer
              </label>
              <input
                type="text"
                id="artist"
                className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                value={newSong.artist}
                onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                placeholder="Enter artist or composer"
              />
            </div>

            {/* YouTube Search Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Youtube size={16} className="mr-1 text-red-500" />
                Find on YouTube (Optional)
              </label>
              
              {(newSong.title || newSong.artist) && !newSong.youtubeVideoId ? (
                <button
                  onClick={() => setShowYouTubeSearch(true)}
                  className="w-full p-3 border border-indigo-200 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"
                >
                  <Youtube size={16} className="mr-2 text-red-500" />
                  <span className="text-indigo-600">Search for videos</span>
                </button>
              ) : !newSong.title && !newSong.artist ? (
                <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  Enter a song title or artist above to search for videos
                </div>
              ) : null}
              
              {showYouTubeSearch && !newSong.youtubeVideoId && (
                <YouTubeSearchResults 
                  searchQuery={`${newSong.title} ${newSong.artist}`.trim()}
                  onSelectVideo={(video) => {
                    if (video) {
                      setNewSong({
                        ...newSong,
                        youtubeVideoId: video.id,
                        youtubeTitle: video.title,
                        youtubeUrl: video.url
                      });
                    }
                    setShowYouTubeSearch(false);
                  }}
                />
              )}
              
              {newSong.youtubeVideoId && (
                <div className="border border-indigo-200 rounded-lg overflow-hidden mt-3">
                  <div className="flex items-center">
                    <div 
                      className="w-24 h-16 flex-shrink-0 cursor-pointer relative"
                      onClick={() => handlePreviewYouTubeVideo(newSong.youtubeVideoId, newSong.youtubeTitle, true)}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${newSong.youtubeVideoId}/mqdefault.jpg`}
                        alt={newSong.youtubeTitle}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all">
                        <div className="opacity-0 hover:opacity-100 transition-opacity">
                          <Youtube size={24} className="text-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2 flex-1">
                      <p className="text-sm line-clamp-2">{newSong.youtubeTitle}</p>
                    </div>
                    <div className="pr-2 flex gap-1">
                      <button
                        onClick={handleClearYouTubeVideo}
                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <ListMusic size={16} className="mr-1 text-indigo-500" />
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                value={newSong.notes}
                onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
                placeholder="Any additional information"
                rows="3"
              />
            </div>
            
            <button
              onClick={handleAddSong}
              disabled={!newSong.title || !newSong.artist}
              className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                (!newSong.title || !newSong.artist) 
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
              }`}
            >
              <PlusCircle size={18} className="mr-1" />
              <span>Submit Song</span>
            </button>
          </div>
        )}
        
        {activeTab === 'vote' && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-700">
              <Heart size={20} className="mr-2 text-pink-500" />
              Vote for Songs
            </h2>
            
            {songs.length === 0 ? (
              <div className="text-center py-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <Music size={48} className="mx-auto text-indigo-300 mb-3" />
                <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
                <p className="text-indigo-400 text-sm mt-1">Be the first to suggest a song!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {songs.map(song => {
                  const hasVoted = song.voters.includes(username);
                  
                  return (
                    <div 
                      key={song.id} 
                      className="border border-indigo-100 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-indigo-700">{song.title}</h3>
                            <p className="text-sm text-indigo-600">{song.artist}</p>
                            
                            {song.youtubeVideoId && (
                              <button
                                onClick={() => handlePreviewYouTubeVideo(song.youtubeVideoId, song.youtubeTitle || `${song.title} - ${song.artist}`, true)}
                                className="mt-2 mb-2 bg-red-50 text-red-700 text-xs py-1 px-2 rounded-md flex items-center w-fit hover:bg-red-100"
                              >
                                <Youtube size={12} className="mr-1" />
                                Play on YouTube
                              </button>
                            )}
                            
                            {song.notes && (
                              <p className="text-sm text-gray-600 mt-1 border-t border-indigo-100 pt-1">{song.notes}</p>
                            )}
                            <p className="text-xs text-indigo-400 mt-2 flex items-center">
                              <Mic size={12} className="mr-1" />
                              Suggested by: {song.suggestedBy}
                            </p>
                          </div>
                          <div className="flex flex-col items-center ml-4">
                            <div className="bg-white text-indigo-700 rounded-full h-8 w-8 flex items-center justify-center font-bold shadow-sm">
                              {song.votes}
                            </div>
                            <button 
                              className={`mt-2 rounded-md px-4 py-1 text-sm flex items-center ${
                                hasVoted
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-sm'
                              }`}
                              onClick={() => handleVote(song.id)}
                              disabled={hasVoted}
                            >
                              <Heart size={14} className="mr-1" />
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-700">
              <BarChart3 size={20} className="mr-2 text-indigo-500" />
              Song Rankings
            </h2>
            
            {songs.length === 0 ? (
              <div className="text-center py-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <ListMusic size={48} className="mx-auto text-indigo-300 mb-3" />
                <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
                <p className="text-indigo-400 text-sm mt-1">Go to the Suggest tab to add a song!</p>
              </div>
            ) : (
              <div>
                <div className="p-4 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                  {[...songs]
                    .sort((a, b) => b.votes - a.votes)
                    .map((song, index) => (
                      <div key={song.id} className="mb-3">
                        <div className="flex items-center">
                          <div className="font-bold w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-2 shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div 
                              className="h-10 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-lg relative overflow-hidden shadow-sm transition-all duration-300 hover:translate-x-1" 
                              style={{ width: `${Math.max((song.votes / Math.max(...songs.map(s => s.votes), 1)) * 100, 10)}%` }}
                            >
                              <div className="absolute inset-0 flex items-center px-3">
                                <span className="text-white font-medium truncate">{song.title}</span>
                                <div className="ml-auto bg-white text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-sm">
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
                
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="text-sm font-semibold mb-3 text-indigo-700 flex items-center">
                    <ListMusic size={16} className="mr-1" />
                    Detailed List
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {[...songs]
                      .sort((a, b) => b.votes - a.votes)
                      .map((song, index) => (
                        <div 
                          key={song.id} 
                          className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className="font-bold w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-indigo-700">
                                  {song.title}
                                </h4>
                                <p className="text-sm text-indigo-600">{song.artist}</p>
                                
                                {song.youtubeVideoId && (
                                  <button
                                    onClick={() => handlePreviewYouTubeVideo(song.youtubeVideoId, song.youtubeTitle || `${song.title} - ${song.artist}`, true)}
                                    className="mt-1 bg-red-50 text-red-700 text-xs py-1 px-2 rounded-md flex items-center w-fit hover:bg-red-100"
                                  >
                                    <Youtube size={12} className="mr-1" />
                                    Play on YouTube
                                  </button>
                                )}
                                
                                <p className="text-xs text-indigo-400 mt-1 flex items-center">
                                  <Mic size={12} className="mr-1" />
                                  Suggested by: {song.suggestedBy}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-sm">
                              <Star size={14} className="mr-1 text-yellow-500" />
                              {song.votes} {song.votes === 1 ? 'vote' : 'votes'}
                            </div>
                          </div>
                          
                          {song.notes && (
                            <div className="mt-3 text-sm text-gray-600 border-t border-indigo-100 pt-2">
                              {song.notes}
                            </div>
                          )}
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

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium line-clamp-1">{previewVideo.title}</h3>
              <button onClick={handleCloseVideoPreview} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${previewVideo.id}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-3 flex justify-end">
              <button
                onClick={handleCloseVideoPreview}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChoirSongApp;