import React, { useState, useEffect } from 'react';
import { 
  X, Check, Heart, BarChart3, PlusCircle, 
  Music, Mic, ArrowRight, ListMusic, 
  Users, Star, Search, Youtube 
} from 'lucide-react';

/**
 * Custom Choir Icon component
 */
const ChoirIcon = ({ size = 28, className = '' }) => {
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
 * Input field component with icon
 */
const InputField = ({ 
  id, label, value, onChange, placeholder, 
  icon: Icon, type = "text", multiline = false, rows = 3 
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
        {Icon && <Icon size={16} className="mr-2 text-indigo-500" />}
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <div className="relative">
          <input
            type={type}
            id={id}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Tab button component
 */
const TabButton = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button
      className={`py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center ${
        active 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {Icon && <Icon size={18} className={active ? "mr-1.5" : "mr-1.5"} />}
      <span className="font-medium">{label}</span>
    </button>
  );
};

/**
 * Song card component
 */
const SongCard = ({ song, onVote, currentUser }) => {
  const hasVoted = song.voters?.includes(currentUser);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-lg truncate">{song.title}</h3>
            <p className="text-gray-600 truncate">{song.artist}</p>
            {song.notes && (
              <p className="text-gray-500 text-sm mt-2 border-t border-gray-100 pt-2">{song.notes}</p>
            )}
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              <Mic size={12} className="mr-1" />
              Suggested by: {song.suggestedBy}
            </p>
          </div>
          <div className="flex flex-col items-center ml-4">
            <div className="bg-indigo-50 text-indigo-700 rounded-full h-9 w-9 flex items-center justify-center font-bold shadow-sm text-lg">
              {song.votes}
            </div>
            <button 
              className={`mt-2 rounded-full px-4 py-1.5 text-sm font-medium flex items-center ${
                hasVoted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-sm'
              }`}
              onClick={() => onVote(song.id)}
              disabled={hasVoted}
            >
              <Heart size={14} className="mr-1.5" fill={hasVoted ? "#9CA3AF" : "white"} />
              {hasVoted ? 'Voted' : 'Vote'}
            </button>
          </div>
        </div>
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
      // Mock search results
      setTimeout(() => {
        setSearchResults([
          { id: 'abc123', title: `${newSong.youtubeQuery} - Official Video`, thumbnail: 'https://via.placeholder.com/120x68' },
          { id: 'def456', title: `${newSong.youtubeQuery} (Live Performance)`, thumbnail: 'https://via.placeholder.com/120x68' },
        ]);
        setIsSearching(false);
      }, 1000);
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
        suggestedBy: username,
        votes: 0,
        voters: []
      };
      setSongs([...songs, songToAdd]);
      setNewSong({ title: '', artist: '', youtubeQuery: '', notes: '' });
      setSearchResults([]);
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
      <div className="flex min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="m-auto w-full max-w-lg px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-center">
                <ChoirIcon size={48} className="bg-white p-2 rounded-lg shadow-lg" />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">RMC Song Wishlist</h1>
                  <p className="text-indigo-200">Share, vote, and discover new songs</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                  <Mic size={16} className="mr-2 text-indigo-500" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
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
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md'
                }`}
              >
                <ArrowRight size={18} className="mr-2" />
                <span className="font-medium">Enter App</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <div className="max-w-lg mx-auto px-4">
        <header className="py-4 sticky top-0 z-10 bg-white bg-opacity-95 backdrop-blur-sm border-b border-indigo-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChoirIcon size={32} />
              <h1 className="text-xl font-bold text-indigo-700 ml-2">RMC Song Wishlist</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Logout"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <p className="text-indigo-600 text-sm flex items-center mt-1">
            <Mic size={14} className="mr-1.5" />
            <span>Logged in as: <span className="font-medium">{username}</span></span>
          </p>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2 mt-4">
            <TabButton
              active={activeTab === 'suggest'}
              onClick={() => setActiveTab('suggest')}
              icon={PlusCircle}
              label="Suggest"
            />
            <TabButton
              active={activeTab === 'vote'}
              onClick={() => setActiveTab('vote')}
              icon={Heart}
              label="Vote"
            />
            <TabButton
              active={activeTab === 'rank'}
              onClick={() => setActiveTab('rank')}
              icon={BarChart3}
              label="Rankings"
            />
          </div>
        </header>
      
        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'suggest' && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <PlusCircle size={20} className="mr-2 text-indigo-500" />
                Suggest a New Song
              </h2>
              
              <InputField 
                id="songTitle"
                label="Song Title"
                value={newSong.title}
                onChange={(e) => setNewSong({...newSong, title: e.target.value})}
                placeholder="Enter song title"
                icon={Music}
              />
              
              <InputField 
                id="artist"
                label="Artist/Composer"
                value={newSong.artist}
                onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
                placeholder="Enter artist or composer"
                icon={Mic}
              />
              
              <div className="mb-4">
                <label htmlFor="youtubeQuery" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                  <Youtube size={16} className="mr-2 text-indigo-500" />
                  Find on YouTube (Optional)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="youtubeQuery"
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200"
                    value={newSong.youtubeQuery}
                    onChange={(e) => setNewSong({...newSong, youtubeQuery: e.target.value})}
                    placeholder="Search for a video"
                  />
                  <button
                    onClick={searchYoutube}
                    disabled={!newSong.youtubeQuery.trim() || isSearching}
                    className={`px-4 rounded-r-lg flex items-center justify-center ${
                      !newSong.youtubeQuery.trim() || isSearching
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    <Search size={18} />
                  </button>
                </div>
                
                {isSearching && (
                  <div className="mt-2 text-sm text-indigo-600 flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                    Searching...
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    <h3 className="text-sm font-medium p-2 bg-gray-50 border-b border-gray-200">Search Results</h3>
                    <div className="divide-y divide-gray-200">
                      {searchResults.map(result => (
                        <div key={result.id} className="p-2 hover:bg-gray-50 flex items-center cursor-pointer">
                          <div className="w-30 h-17 bg-gray-100 flex-shrink-0 mr-3 rounded overflow-hidden">
                            <img src={result.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{result.title}</p>
                          </div>
                          <button className="ml-2 p-1 text-indigo-600 hover:text-indigo-800">
                            <PlusCircle size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <InputField 
                id="notes"
                label="Additional Notes (Optional)"
                value={newSong.notes}
                onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
                placeholder="Any additional information"
                icon={ListMusic}
                multiline={true}
              />
              
              <button
                onClick={handleAddSong}
                disabled={!newSong.title || !newSong.artist}
                className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                  (!newSong.title || !newSong.artist) 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md'
                }`}
              >
                <PlusCircle size={18} className="mr-2" />
                <span className="font-medium">Submit Song</span>
              </button>
            </div>
          )}
          
          {activeTab === 'vote' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold px-1 flex items-center text-gray-800">
                <Heart size={20} className="mr-2 text-pink-500" />
                Vote for Songs
              </h2>
              
              {songs.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                  <Music size={48} className="mx-auto text-indigo-300 mb-3" />
                  <p className="text-gray-600 font-medium">No songs have been suggested yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to suggest a song!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {songs.map(song => (
                    <SongCard 
                      key={song.id} 
                      song={song} 
                      onVote={handleVote} 
                      currentUser={username}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'rank' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold px-1 flex items-center text-gray-800">
                <BarChart3 size={20} className="mr-2 text-indigo-500" />
                Song Rankings
              </h2>
              
              {songs.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                  <ListMusic size={48} className="mx-auto text-indigo-300 mb-3" />
                  <p className="text-gray-600 font-medium">No songs have been suggested yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Go to the Suggest tab to add a song!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-sm font-medium mb-4 text-gray-700 border-b border-gray-100 pb-2">Top Songs</h3>
                    {[...songs]
                      .sort((a, b) => b.votes - a.votes)
                      .map((song, index) => (
                        <div key={song.id} className="mb-3">
                          <div className="flex items-center">
                            <div className="font-bold w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm shadow-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 ml-3">
                              <div 
                                className="h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg relative overflow-hidden shadow-sm transition-all duration-300" 
                                style={{ width: `${Math.max((song.votes / Math.max(...songs.map(s => s.votes), 1)) * 100, 15)}%` }}
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
                  
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <h3 className="text-sm font-medium p-4 border-b border-gray-100 text-gray-700">
                      Detailed List
                    </h3>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {[...songs]
                        .sort((a, b) => b.votes - a.votes)
                        .map((song, index) => (
                          <div 
                            key={song.id} 
                            className="p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="font-bold w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-sm shadow-sm mr-3 flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 truncate">
                                  {song.title}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                                {song.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{song.notes}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                  <Mic size={12} className="mr-1" />
                                  Suggested by: {song.suggestedBy}
                                </p>
                              </div>
                              <div className="ml-4 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center shadow-sm">
                                <Star size={14} className="mr-1 text-yellow-500" />
                                {song.votes}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
        <div className="flex max-w-lg mx-auto">
          <button
            className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'suggest' 
                ? 'text-indigo-600' 
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => setActiveTab('suggest')}
          >
            <PlusCircle size={22} />
            <span className="text-xs mt-1 font-medium">Suggest</span>
          </button>
          <button
            className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'vote' 
                ? 'text-indigo-600' 
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => setActiveTab('vote')}
          >
            <Heart size={22} />
            <span className="text-xs mt-1 font-medium">Vote</span>
          </button>
          <button
            className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'rank' 
                ? 'text-indigo-600' 
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => setActiveTab('rank')}
          >
            <BarChart3 size={22} />
            <span className="text-xs mt-1 font-medium">Rankings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoirSongApp;