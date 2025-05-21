import React from 'react';
import { BarChart3, ListMusic, Mic, Star } from 'lucide-react';

const RankingsTab = ({ songs = [] }) => {
  // Safely handle sorting and calculations
  const sortedSongs = React.useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return [];
    return [...songs].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  }, [songs]);

  // Calculate max votes safely to avoid division by zero
  const maxVotes = React.useMemo(() => {
    if (!Array.isArray(songs) || songs.length === 0) return 1;
    return Math.max(...songs.map(song => song.votes || 0), 1);
  }, [songs]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-700">
        <BarChart3 size={20} className="mr-2 text-indigo-500" />
        Song Rankings
      </h2>
      
      {!Array.isArray(songs) || songs.length === 0 ? (
        <div className="text-center py-10 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
          <ListMusic size={48} className="mx-auto text-indigo-300 mb-3" />
          <p className="text-indigo-600 font-medium">No songs have been suggested yet.</p>
          <p className="text-indigo-400 text-sm mt-1">Go to the Suggest tab to add a song!</p>
        </div>
      ) : (
        <div>
          {/* Bar chart visualization */}
          <div className="p-4 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
            {sortedSongs.map((song, index) => (
              <div key={song.id || index} className="mb-3">
                <div className="flex items-center">
                  <div className="font-bold w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-2 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div 
                      className="h-10 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-lg relative overflow-hidden shadow-sm transition-all duration-300 hover:translate-x-1" 
                      style={{ width: `${Math.max(((song.votes || 0) / maxVotes) * 100, 10)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-white font-medium truncate">{song.title || 'Untitled'}</span>
                        <div className="ml-auto bg-white text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-sm">
                          {song.votes || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Detailed list */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100">
            <h3 className="text-sm font-semibold mb-3 text-indigo-700 flex items-center">
              <ListMusic size={16} className="mr-1" />
              Detailed List
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {sortedSongs.map((song, index) => (
                <div 
                  key={song.id || index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="font-bold w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-indigo-700">
                          {song.title || 'Untitled'}
                        </h4>
                        <p className="text-sm text-indigo-600">{song.artist || 'Unknown Artist'}</p>
                        <p className="text-xs text-indigo-400 mt-1 flex items-center">
                          <Mic size={12} className="mr-1" />
                          Suggested by: {song.suggestedBy || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-sm">
                      <Star size={14} className="mr-1 text-yellow-500" />
                      {song.votes || 0} {(song.votes || 0) === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                  
                  {song.notes && (
                    <div className="mt-3 text-sm text-gray-600 border-t border-indigo-100 pt-2">
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
  );
};

export default RankingsTab;