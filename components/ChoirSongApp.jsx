'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Heart, BarChart3, PlusCircle, Music, Mic, ArrowRight, ArrowLeft, ListMusic, Users, Star, AlertCircle } from 'lucide-react';
import YouTubeSearch from './YouTubeSearch';
import { useAuth } from '../hooks/useAuth';
import { useSongs } from '../hooks/useSongs';
import { useVotes } from '../hooks/useVotes';
import { getYouTubeEmbedUrl } from '../lib/youtube-api';

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
 * Main ChoirSongApp component with database and YouTube integration
 */
const ChoirSongApp = () => {
  // State for active tab and new song form
  const [activeTab, setActiveTab] = useState('suggest');
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    notes: '',
    youtubeUrl: '',
    youtubeThumb: '',
    youtubeTitle: '',
    youtubeVideoId: ''
  });
  const [currentVoteIndex, setCurrentVoteIndex] = useState(0);
  
  // Use custom hooks for auth, songs, and votes
  const { user, isLoading: authLoading, error: authError, login, logout, isLoggedIn } = useAuth();
  const { songs, isLoading: songsLoading, error: songsError, addNewSong, getSongsToVote, getSortedSongs } = useSongs(user);
  const { isVoting, error: voteError, voteForSong } = useVotes(user);
  
  // Local form state for login
  const [username, setUsername] = useState('');
  
  // Get filtered songs lists
  const songsToVote = getSongsToVote();
  const sortedSongs = getSortedSongs();
  
  // Listen for local vote events (when Supabase is not available)
  useEffect(() => {
    const handleLocalVote = (event) => {
      const { songId, userId } = event.detail;
      setSongs(prevSongs => 
        prevSongs.map(song => 
          song.id === songId 
            ? { 
                ...song, 
                votes: song.votes + 1, 
                voters: [...song.voters, userId],
                votedByCurrentUser: userId === user?.id || song.votedByCurrentUser 
              }
            : song
        )
      );
    };
    
    window.addEventListener('local-vote', handleLocalVote);
    
    return () => {
      window.removeEventListener('local-vote', handleLocalVote);
    };
  }, [user]);
  
  // Handle login
  const handleLogin = async () => {
    const success = await login(username);
    if (success) {
      setActiveTab('suggest');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Handle YouTube video selection
  const handleSelectVideo = (video) => {
    setNewSong({
      ...newSong,
      youtubeUrl: getYouTubeEmbedUrl(video.videoId),
      youtubeThumb: video.thumbnail,
      youtubeTitle: video.title,
      youtubeVideoId: video.videoId
    });
  };
  
  // Handle adding a new song
  const handleAddSong = async () => {
    if (!newSong.title || !newSong.artist || !newSong.youtubeVideoId) return;
    
    const result = await addNewSong(newSong);
    if (result) {
      // Clear form after successful submission
      setNewSong({
        title: '',
        artist: '',
        notes: '',
        youtubeUrl: '',
        youtubeThumb: '',
        youtubeTitle: '',
        youtubeVideoId: ''
      });
    }
  };
  
  // Handle voting for a song
  const handleVote = async (songId) => {
    const success = await voteForSong(songId);
    if (success) {
      moveToNextCard();
    }
  };
  
  // Move to the next card in the voting stack
  const moveToNextCard = () => {
    if (currentVoteIndex < songsToVote.length - 1) {
      setCurrentVoteIndex(prev => prev + 1);
    } else {
      // No more songs to vote on
      setCurrentVoteIndex(0); // Reset to beginning
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
          
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}
          
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
            disabled={authLoading || !username.trim()}
            className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
              authLoading || !username.trim() 
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
            }`}
          >
            {authLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <ArrowRight size={18} className="mr-1" />
                <span>Enter App</span>
              </>
            )}
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
            <span>Logged in as: {user?.name}</span>
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

        {/* Tab Content - Add padding at bottom to account for fixed tab bar */}
        <div className="pb-20">
          {activeTab === 'suggest' && (
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
              <div className="p-4 border-b border-indigo-100 flex items-center">
                <PlusCircle size={20} className="text-indigo-500 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-700">Suggest a New Song</h2>
              </div>
              
              <div className="p-4">
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
                    autoComplete="off"
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
                    autoComplete="off"
                  />
                </div>
                
                {/* YouTube Search - Only show if title and artist are entered but no video selected yet */}
                {(newSong.title && newSong.artist) && !newSong.youtubeUrl && (
                  <YouTubeSearch
                    songTitle={newSong.title}
                    songArtist={newSong.artist}
                    onSelectVideo={handleSelectVideo}
                  />
                )}
                
                {/* Selected YouTube Video */}
                {newSong.youtubeUrl && (
                  <div className="mb-4">
                    <p className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <ListMusic size={16} className="mr-1 text-indigo-500" />
                      Selected Video:
                    </p>
                    <div className="relative pt-56.25 h-0 overflow-hidden rounded-lg bg-gray-100 shadow-inner border border-indigo-100">
                      <iframe 
                        src={newSong.youtubeUrl} 
                        className="absolute top-0 left-0 w-full h-full" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        title={newSong.title}
                      ></iframe>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{newSong.youtubeTitle}</p>
                    <button 
                      onClick={() => setNewSong({...newSong, youtubeUrl: '', youtubeThumb: '', youtubeTitle: '', youtubeVideoId: ''})}
                      className="mt-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                    >
                      <X size={12} className="mr-1" />
                      Change video
                    </button>
                  </div>
                )}
                
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
                  disabled={!newSong.title || !newSong.artist || !newSong.youtubeUrl || songsLoading}
                  className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                    (!newSong.title || !newSong.artist || !newSong.youtubeUrl || songsLoading) 
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
                  }`}
                >
                  {songsLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <PlusCircle size={18} className="mr-1" />
                      <span>Submit Song</span>
                    </>
                  )}
                </button>
                
                {songsError && (
                  <p className="mt-2 text-sm text-red-600">{songsError}</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'vote' && (
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
              <div className="p-4 border-b border-indigo-100 flex items-center">
                <Heart size={20} className="text-pink-500 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-700">Vote for Songs</h2>
              </div>
              
              <div className="p-4">
                {songsLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                    <p className="text-indigo-600">Loading songs...</p>
                  </div>
                ) : songsToVote.length === 0 ? (
                  <div className="text-center py-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    {songs.length === 0 ? (
                      <div>
                        <Music size={40} className="mx-auto text-indigo-300 mb-3" />
                        <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
                        <p className="text-indigo-400 text-sm mt-1">Be the first to suggest a song!</p>
                      </div>
                    ) : (
                      <div>
                        <ListMusic size={40} className="mx-auto text-indigo-300 mb-3" />
                        <p className="text-indigo-600 font-medium">You've voted on all available songs!</p>
                        <p className="text-indigo-400 text-sm mt-1">Check back later for new suggestions.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {songsToVote.map(song => (
                      <div 
                        key={song.id} 
                        className="border border-indigo-100 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <div className="relative h-0 pt-56.25 bg-gray-100">
                          <iframe 
                            src={song.youtubeUrl} 
                            className="absolute top-0 left-0 w-full h-full" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            title={song.title}
                          ></iframe>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-indigo-700">{song.title}</h3>
                              <p className="text-sm text-indigo-600">{song.artist}</p>
                              {song.notes && (
                                <p className="text-sm text-gray-600 mt-1 border-t border-indigo-100 pt-1">{song.notes}</p>
                              )}
                              <p className="text-xs text-indigo-400 mt-2 flex items-center">
                                <Mic size={12} className="mr-1" />
                                Suggested by: {song.suggestedBy}
                              </p>
                            </div>
                            <div className="flex flex-col items-center ml-4">
                              <button 
                                className="mt-2 rounded-lg px-4 py-2 text-sm flex items-center bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-sm"
                                onClick={() => handleVote(song.id)}
                                disabled={isVoting}
                              >
                                {isVoting ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Voting...
                                  </span>
                                ) : (
                                  <>
                                    <Heart size={16} className="mr-1" />
                                    Vote
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {voteError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-600">{voteError}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'rank' && (
            <div className="bg-white rounded-xl shadow-md border border-indigo-100 overflow-hidden">
              <div className="p-4 border-b border-indigo-100 flex items-center">
                <BarChart3 size={20} className="text-indigo-500 mr-2" />
                <h2 className="text-lg font-semibold text-indigo-700">Song Rankings</h2>
              </div>
              
              <div className="p-4">
                {songsLoading ? (
                  <div className="text-center py-10">
                    <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto mb-4"></div>
                    <p className="text-indigo-600">Loading rankings...</p>
                  </div>
                ) : songs.length === 0 ? (
                  <div className="text-center py-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                    <ListMusic size={40} className="mx-auto text-indigo-300 mb-3" />
                    <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
                    <p className="text-indigo-400 text-sm mt-1">Go to the Suggest tab to add a song!</p>
                  </div>
                ) : (
                  <div>
                    <div className="p-3 mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                      {sortedSongs.map((song, index) => (
                        <div key={song.id} className="mb-3">
                          <div className="flex items-center">
                            <div className="font-bold w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-2 shadow-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div 
                                className="h-9 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-lg relative overflow-hidden shadow-sm transition-all duration-300" 
                                style={{ width: `${Math.max((song.votes / Math.max(...songs.map(s => s.votes), 1)) * 100, 10)}%` }}
                              >
                                <div className="absolute inset-0 flex items-center px-3">
                                  <span className="text-white font-medium truncate text-sm">{song.title}</span>
                                  <div className="ml-auto bg-white text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-sm">
                                    {song.votes}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-100">
                      <h3 className="text-sm font-semibold mb-3 text-indigo-700 flex items-center">
                        <ListMusic size={16} className="mr-1" />
                        Detailed List
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {sortedSongs.map((song, index) => (
                          <div 
                            key={song.id} 
                            className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start">
                                <div className="font-bold w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-2 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-indigo-700 text-sm">
                                    {song.title}
                                  </h4>
                                  <p className="text-xs text-indigo-600">{song.artist}</p>
                                  <p className="text-xs text-indigo-400 mt-1 flex items-center">
                                    <Mic size={10} className="mr-1" />
                                    {song.suggestedBy}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm">
                                <Star size={12} className="mr-1 text-yellow-500" />
                                {song.votes}
                              </div>
                            </div>
                            
                            <div className="mt-2 relative pt-44 h-0 overflow-hidden rounded-lg bg-gray-100 shadow-inner">
                              <iframe 
                                src={song.youtubeUrl} 
                                className="absolute top-0 left-0 w-full h-full" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                title={song.title}
                              ></iframe>
                            </div>
                            
                            {song.notes && (
                              <div className="mt-2 text-xs text-gray-600 border-t border-indigo-100 pt-2">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoirSongApp;