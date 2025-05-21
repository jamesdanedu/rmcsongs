import React, { useState, useEffect } from 'react';
import { X, Mic, PlusCircle, Heart, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import UserLoginForm from './UserLoginForm';
import RankingsTab from './RankingsTab';
import VoteTab from './VoteTab';
import SuggestTab from './SuggestTab';
import ChoirIcon from './ChoirIcon';

const ChoirSongApp = () => {
  // Use your auth hook
  const { user, isLoggedIn, logout } = useAuth();
  
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
  
  // Song handlers
  const handleAddSong = () => {
    if (newSong.title && newSong.artist) {
      const songToAdd = {
        id: Date.now(),
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        suggestedBy: user?.fullName || 'Anonymous',
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
        ? { 
            ...song, 
            votes: song.votes + 1, 
            voters: [...song.voters, user?.id || user?.fullName] 
          }
        : song
    ));
  };
  
  // Show login form if not logged in
  if (!isLoggedIn) {
    return <UserLoginForm />;
  }
  
  // Main app content when logged in
  return (
    <div className="min-h-screen w-full pb-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <header className="py-4 mb-4 sticky top-0 z-10 bg-gradient-to-b from-indigo-50 to-blue-100 backdrop-blur-sm">
          <div className="bg-white p-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="flex items-center">
              <ChoirIcon size={24} />
              <h1 className="text-xl font-bold text-indigo-700 ml-2">RMC Song Wishlist</h1>
            </div>
            <div className="flex items-center">
              <button 
                onClick={logout}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <span className="sr-only md:not-sr-only md:inline">Logout</span>
                <X size={16} className="ml-1" />
              </button>
            </div>
          </div>
          
          <p className="text-indigo-600 text-sm text-center mt-1 flex items-center justify-center">
            <Mic size={14} className="mr-1" />
            <span>Logged in as: {user?.fullName}</span>
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
            username={user?.fullName}
            userId={user?.id}
            handleVote={handleVote}
          />
        )}
        
        {activeTab === 'rank' && <RankingsTab songs={songs} />}

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

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
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
              activeTab === id 
                ? 'text-indigo-600' 
                : 'text-gray-500 hover:text-indigo-500'
            } transition-colors duration-200`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoirSongApp;