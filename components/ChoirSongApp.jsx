'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Heart, BarChart3, PlusCircle, Music, Mic, ArrowRight, ListMusic, Users, Star, Search, ExternalLink, Youtube } from 'lucide-react';

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
 * Extracts the video ID from a YouTube URL
 */
function extractVideoId(url) {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * YouTube Search Results component
 */
const YouTubeSearchResults = ({ results, onSelect, onClose }) => {
  if (results.length === 0) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-indigo-200 rounded-lg shadow-lg mt-2 z-20 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-indigo-100 p-2 flex justify-between items-center">
        <h4 className="font-medium text-indigo-700 flex items-center">
          <Youtube size={16} className="mr-1 text-red-500" />
          Search Results
        </h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-2">
        {results.map((video) => (
          <div 
            key={video.id} 
            className="flex items-start p-2 hover:bg-indigo-50 rounded cursor-pointer transition-colors duration-200"
            onClick={() => onSelect(video)}
          >
            <div className="flex-shrink-0 mr-2 relative">
              <img 
                src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} 
                alt={video.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-10">
                <div className="bg-red-600 rounded-full p-1">
                  <Youtube size={16} className="text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{video.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Enhanced ChoirSongApp with YouTube search functionality
 */
const ChoirSongApp = () => {
  // Local state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('suggest');
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    notes: '',
    youtubeUrl: '',
    youtubeVideoId: ''
  });
  
  // YouTube search state
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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
        localStorage.setItem('rmc_songs', JSON.stringify([]));
      }
    } else {
      localStorage.setItem('rmc_songs', JSON.stringify([]));
    }
    
    // Check for active tab
    const storedTab = localStorage.getItem('rmc_active_tab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rmc_songs', JSON.stringify(songs));
  }, [songs]);
  
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('rmc_active_tab', activeTab);
    }
  }, [activeTab]);
  
  // Login handler
  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('rmc_username', username);
      setIsLoggedIn(true);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('rmc_username');
    setIsLoggedIn(false);
    setUsername('');
  };
  
  // Add song handler
  const handleAddSong = () => {
    if (newSong.title && newSong.artist) {
      const songToAdd = {
        id: Date.now(),
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeUrl: newSong.youtubeUrl,
        youtubeVideoId: newSong.youtubeVideoId,
        suggestedBy: username,
        votes: 0,
        voters: []
      };
      setSongs([...songs, songToAdd]);
      setNewSong({ 
        title: '', 
        artist: '', 
        notes: '',
        youtubeUrl: '',
        youtubeVideoId: ''
      });
    }
  };

  // Vote handler
  const handleVote = (songId) => {
    setSongs(songs.map(song => 
      song.id === songId 
        ? { ...song, votes: song.votes + 1, voters: [...song.voters, username] }
        : song
    ));
  };
  
  // Handle YouTube URL input
  const handleYouTubeUrlChange = (e) => {
    const url = e.target.value;
    const videoId = extractVideoId(url);
    
    setNewSong({
      ...newSong,
      youtubeUrl: url,
      youtubeVideoId: videoId || ''
    });
  };
  
  // Handle YouTube search
  const handleYouTubeSearch = async () => {
    if (!youtubeSearchQuery.trim()) return;
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      // Mock search functionality - in a real app, you would use the YouTube API
      // This is simulating API results with some sample data
      setTimeout(() => {
        const mockResults = [
          {
            id: 'gxEPV4kolz0',
            title: 'Billy Joel - Piano Man (Official Video)',
            channelTitle: 'billyjoelVEVO',
            description: 'Official video for Piano Man by Billy Joel...'
          },
          {
            id: 'dQw4w9WgXcQ',
            title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
            channelTitle: 'Rick Astley',
            description: 'The official music video for Never Gonna Give You Up...'
          },
          {
            id: 'L0MK7qz13bU',
            title: 'FROZEN | Let It Go Sing-along | Official Disney UK',
            channelTitle: 'Disney UK',
            description: 'Sing along with Idina Menzel in Disney\'s Frozen...'
          }
        ];
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      console.error('Error searching YouTube:', error);
      setIsSearching(false);
    }
  };
  
  // Handle video selection from search results
  const handleVideoSelect = (video) => {
    setNewSong({
      ...newSong,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
      youtubeVideoId: video.id
    });
    
    // Check if the song title and artist are empty, populate from video
    if (!newSong.title) {
      // Try to extract title and artist from video title
      const parts = video.title.split(' - ');
      if (parts.length > 1) {
        setNewSong(prev => ({
          ...prev,
          title: parts[1].split('(')[0].trim(), // Remove anything in parenthesis
          artist: parts[0].trim(),
          youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
          youtubeVideoId: video.id
        }));
      } else {
        setNewSong(prev => ({
          ...prev,
          title: video.title,
          youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
          youtubeVideoId: video.id
        }));
      }
    }
    
    setShowSearchResults(false);
    setYoutubeSearchQuery('');
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
    <div className="min-h-screen w-full pb-20">
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
        <div className="mb-20"> {/* Added margin to ensure content doesn't get hidden behind the bottom nav */}
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
              
              {/* YouTube URL and Search Section */}
              <div className="mb-4">
                <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Youtube size={16} className="mr-1 text-red-500" />
                  Find on YouTube
                </label>
                
                <div className="mb-2">
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="youtubeUrl"
                      className="flex-1 p-3 border border-indigo-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                      value={newSong.youtubeUrl}
                      onChange={handleYouTubeUrlChange}
                      placeholder="Paste YouTube URL"
                    />
                    <a 
                      href={newSong.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-indigo-100 border border-indigo-200 rounded-r-lg text-indigo-500 ${!newSong.youtubeUrl ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-200'}`}
                      onClick={(e) => !newSong.youtubeUrl && e.preventDefault()}
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-2">or</div>
                
                <div className="relative">
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-indigo-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                      value={youtubeSearchQuery}
                      onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                      placeholder="Search for a song"
                      onKeyPress={(e) => e.key === 'Enter' && handleYouTubeSearch()}
                    />
                    <button
                      onClick={handleYouTubeSearch}
                      className="p-3 bg-indigo-500 border border-indigo-500 rounded-r-lg text-white hover:bg-indigo-600 transition-colors duration-200"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                  
                  {/* Show YouTube preview if a video ID is available */}
                  {newSong.youtubeVideoId && (
                    <div className="mt-3 bg-gray-100 p-2 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-2">
                          <img 
                            src={`https://i.ytimg.com/vi/${newSong.youtubeVideoId}/mqdefault.jpg`} 
                            alt="Video thumbnail"
                            className="w-20 h-16 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">
                            <span className="font-medium">Selected:</span> YouTube video
                          </p>
                          <button 
                            className="text-xs text-red-500 hover:text-red-700"
                            onClick={() => setNewSong({...newSong, youtubeUrl: '', youtubeVideoId: ''})}
                          >
                            Clear selection
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* YouTube search results */}
                  {showSearchResults && (
                    <YouTubeSearchResults 
                      results={searchResults}
                      onSelect={handleVideoSelect}
                      onClose={() => setShowSearchResults(false)}
                    />
                  )}
                </div>
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
                  {songs.filter(song => !song.voters.includes(username)).map(song => (
                    <div 
                      key={song.id} 
                      className="border border-indigo-100 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-indigo-700">{song.title}</h3>
                            <p className="text-sm text-indigo-600">{song.artist}</p>
                            
                            {/* Show YouTube thumbnail if available */}
                            {song.youtubeVideoId && (
                              <div className="mt-2 mb-2">
                                <a
                                  href={`https://www.youtube.com/watch?v=${song.youtubeVideoId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block relative"
                                >
                                  <img 
                                    src={`https://i.ytimg.com/vi/${song.youtubeVideoId}/mqdefault.jpg`} 
                                    alt={song.title}
                                    className="w-full h-32 object-cover rounded"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-10">
                                    <div className="bg-red-600 rounded-full p-2">
                                      <Youtube size={24} className="text-white" />
                                    </div>
                                  </div>
                                </a>
                              </div>
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
                              className="mt-2 rounded-md px-4 py-1 text-sm flex items-center bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-sm"
                              onClick={() => handleVote(song.id)}
                            >
                              <Heart size={14} className="mr-1" />
                              Vote
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {songs.filter(song => !song.voters.includes(username)).length === 0 && (
                    <div className="text-center py-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                      <Check size={48} className="mx-auto text-green-400 mb-3" />
                      <p className="text-indigo-600 font-medium">You've voted on all available songs!</p>
                      <p className="text-indigo-400 text-sm mt-1">Check back later for new songs to vote on.</p>
                    </div>
                  )}
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
                                  
                                  {/* Show YouTube link if available */}
                                  {song.youtubeVideoId && (
                                    <a
                                      href={`https://www.youtube.com/watch?v=${song.youtubeVideoId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-red-600 hover:text-red-800 mt-1"
                                    >
                                      <Youtube size={12} className="mr-1" />
                                      Watch on YouTube
                                    </a>
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
      </div>
    </div>
  );
};

export default ChoirSongApp;