import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3 } from 'lucide-react';
import RankingsTab from './RankingsTab';
import VoteTab from './VoteTab';
import SuggestTab from './SuggestTab';
import ChoirIcon from './ChoirIcon';
import UserLoginForm from './UserLoginForm';

/**
 * Main App Component for the RMC Song Wishlist
 */
const ChoirSongApp = () => {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  
  // App state
  const [activeTab, setActiveTab] = useState('suggest');
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    notes: ''
  });

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
  
  // Authentication handlers
  const handleLogin = () => {
    if (username.trim()) {
      localStorage.setItem('rmc_username', username);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rmc_username');
    setIsLoggedIn(false);
    setUsername('');
  };
  
  // Song handlers
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
      setNewSong({ title: '', artist: '', notes: '' });
    }
  };

  const handleVote = (songId) => {
    setSongs(songs.map(song => 
      song.id === songId 
        ? { ...song, votes: song.votes + 1, voters: [...song.voters, username] }
        : song
    ));
  };
  
  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
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
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm hover:shadow-md'
            }`}
          >
            <span>Enter App</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Main app content when logged in
  return (
    <div className="min-h-screen w-full pb-20 bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <header className="py-4 mb-4 sticky top-0 z-10 bg-gradient-to-b from-indigo-50 to-blue-100 backdrop-blur-sm">
          <div className="bg-white p-3 rounded-lg shadow-md flex items-center justify-between border border-indigo-100 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center">
              <ChoirIcon size={24} />
              <h1 className="text-xl font-bold text-indigo-700 ml-2">RMC Song Wishlist</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center transition-colors duration-200"
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

        {/* Tab Content */}
        {activeTab === 'suggest' && (
          <SuggestTab 
            newSong={newSong} 
            setNewSong={setNewSong} 
            handleAddSong={handleAddSong} 
          />
        )}
        
        {activeTab === 'vote' && (
          <VoteTab 
            songs={songs} 
            username={username}
            handleVote={handleVote}
          />
        )}
        
        {activeTab === 'rank' && <RankingsTab songs={songs} />}

        {/* Tab Navigation - Fixed to bottom for mobile */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

/**
 * Tab Navigation Component
 */
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'suggest', label: 'Suggest', Icon: PlusCircle },
    { id: 'vote', label: 'Vote', Icon: Heart },
    { id: 'rank', label: 'Rankings', Icon: BarChart3 }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-indigo-100 z-10">
      <div className="flex max-w-md mx-auto">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center transition-all duration-200 ${
              activeTab === id 
                ? 'text-indigo-600 scale-105 translate-y-[-2px]' 
                : 'text-gray-500 hover:text-indigo-500'
            }`}
            onClick={() => setActiveTab(id)}
          >
            <div className={`${activeTab === id ? 'bg-indigo-100 p-1.5 rounded-full' : ''}`}>
              <Icon size={20} className={activeTab === id ? 'text-indigo-600' : 'text-gray-500'} />
            </div>
            <span className={`text-xs mt-1 ${activeTab === id ? 'font-medium' : ''}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoirSongApp;