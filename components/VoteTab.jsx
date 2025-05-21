import React from 'react';
import { Heart, Music, Mic } from 'lucide-react';

/**
 * VoteTab component for displaying songs and allowing users to vote
 */
const VoteTab = ({ songs = [], username = '', handleVote }) => {
  if (!handleVote || typeof handleVote !== 'function') {
    console.error('VoteTab: handleVote is required and must be a function');
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
        <p className="text-red-500">Error: Vote functionality unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-700">
        <Heart size={20} className="mr-2 text-pink-500" />
        Vote for Songs
      </h2>
      
      {!Array.isArray(songs) || songs.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
          <Music size={48} className="mx-auto text-indigo-300 mb-3" />
          <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
          <p className="text-indigo-400 text-sm mt-1">Be the first to suggest a song!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {songs.map(song => {
            // Check if song has voters array and if current user has already voted
            const hasVoters = Array.isArray(song.voters);
            const hasVoted = hasVoters && (song.voters.includes(username) || song.voters.includes(userId));
            return (
              <div 
                key={song.id || `song-${Math.random()}`} 
                className="border border-indigo-100 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-indigo-700">{song.title || 'Untitled'}</h3>
                      <p className="text-sm text-indigo-600">{song.artist || 'Unknown Artist'}</p>
                      {song.notes && (
                        <p className="text-sm text-gray-600 mt-1 border-t border-indigo-100 pt-1">{song.notes}</p>
                      )}
                      <p className="text-xs text-indigo-400 mt-2 flex items-center">
                        <Mic size={12} className="mr-1" />
                        Suggested by: {song.suggestedBy || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex flex-col items-center ml-4">
                      <div className="bg-white text-indigo-700 rounded-full h-8 w-8 flex items-center justify-center font-bold shadow-sm">
                        {song.votes || 0}
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
  );
};

export default VoteTab;