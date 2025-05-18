import React, { useState, useEffect } from 'react';
import { searchYouTubeVideos } from '../lib/youtube-api';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';

const YouTubeSearch = ({ songTitle, songArtist, onSelectVideo }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Check if YouTube API key is available
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      setApiKeyMissing(true);
    }
  }, []);

  // Handle YouTube search
  const handleSearch = async () => {
    if (!songTitle || !songArtist) {
      setError('Please enter both song title and artist before searching');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const query = `${songTitle} ${songArtist}`;
      console.log('Searching YouTube for:', query);
      
      const results = await searchYouTubeVideos(query);
      console.log('Search results:', results);
      
      if (!results || results.length === 0) {
        setError('No results found. Try a different search term.');
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      console.error('YouTube search error:', err);
      setError(`Failed to search YouTube: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to handle mock video selection
  const handleMockVideoSelection = () => {
    // Create a mock video object
    const mockVideo = {
      id: 'mock1',
      title: `${songTitle} - ${songArtist}`,
      thumbnail: 'https://via.placeholder.com/320x180?text=No+YouTube+API',
      videoId: 'dQw4w9WgXcQ', // This is actually Rick Astley's "Never Gonna Give You Up"
      channelTitle: `${songArtist}`
    };
    
    onSelectVideo(mockVideo);
  };

  // If API key is missing, show a simplified interface
  if (apiKeyMissing) {
    return (
      <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-2 text-amber-600">
            <AlertCircle size={16} className="mr-1" />
            <p className="text-sm font-medium">YouTube API key not configured</p>
          </div>
          
          <button
            onClick={handleMockVideoSelection}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-blue-600 shadow-sm transition-all duration-200 flex items-center justify-center"
          >
            <ArrowRight size={16} className="mr-1" />
            <span>Use placeholder video</span>
          </button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            A placeholder will be used until you add a YouTube API key.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
      <div className="flex items-center mb-2">
        <button
          onClick={handleSearch}
          disabled={isSearching || !songTitle || !songArtist}
          className={`flex items-center py-2 px-4 rounded-lg transition-all duration-200 ${
            isSearching || !songTitle || !songArtist
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-sm'
          }`}
        >
          {isSearching ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : (
            <>
              <Search size={16} className="mr-1" />
              <span>Find on YouTube</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Search size={16} className="mr-1 text-indigo-500" />
            Select a video:
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-indigo-100">
            {searchResults.map(video => (
              <div
                key={video.id}
                className="flex items-center p-3 hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
                onClick={() => onSelectVideo(video)}
              >
                <div className="relative rounded-md overflow-hidden w-24 h-16 bg-gray-100 flex-shrink-0">
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-10 transition-all duration-150">
                    <div className="w-8 h-8 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <ArrowRight size={16} className="text-red-600 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <p className="text-xs text-gray-500 truncate">{video.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;