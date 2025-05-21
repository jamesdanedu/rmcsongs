import React from 'react';
import { PlusCircle, Music, Mic, ListMusic } from 'lucide-react';

/**
 * SuggestTab component for adding new songs
 */
const SuggestTab = ({ newSong, setNewSong, handleAddSong }) => {
  // Input validation
  const isValid = newSong?.title?.trim() && newSong?.artist?.trim();
  
  // Error checking for props
  if (!setNewSong || typeof setNewSong !== 'function' || !handleAddSong || typeof handleAddSong !== 'function') {
    console.error('SuggestTab: setNewSong and handleAddSong are required and must be functions');
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <p className="text-red-500">Error: Song suggestion functionality unavailable</p>
      </div>
    );
  }

  return (
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
          value={newSong?.title || ''}
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
          value={newSong?.artist || ''}
          onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
          placeholder="Enter artist or composer"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <ListMusic size={16} className="mr-1 text-indigo-500" />
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
          value={newSong?.notes || ''}
          onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
          placeholder="Any additional information"
          rows="3"
        />
      </div>
      
      <button
        onClick={handleAddSong}
        disabled={!isValid}
        className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
          !isValid
            ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
        }`}
      >
        <PlusCircle size={18} className="mr-1" />
        <span>Submit Song</span>
      </button>
    </div>
  );
};

export default SuggestTab;