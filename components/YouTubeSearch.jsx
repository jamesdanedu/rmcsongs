
import React, { useState } from 'react';
import { Search, Youtube, ExternalLink, CheckCircle } from 'lucide-react';
import { extractVideoId, isValidYouTubeVideoId, getYouTubeThumbnail } from '../lib/youtube-api';

const YouTubeSearch = ({ onSelectVideo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [directVideoUrl, setDirectVideoUrl] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setError(null);
  };
  
  // Handle direct video URL input change
  const handleDirectUrlChange = (e) => {
    setDirectVideoUrl(e.target.value);
    setError(null);
    
    // If valid video ID is detected, preview it
    const videoId = extractVideoId(e.target.value);
    if (videoId && isValidYouTubeVideoId(videoId)) {
      previewDirectVideo(videoId);
    } else if (e.target.value && !isValidYouTubeVideoId(extractVideoId(e.target.value))) {
      setSelectedVideo(null);
    }
  };
  
  // Preview a video from direct URL
  const previewDirectVideo = (videoId) => {
    if (!videoId) return;
    
    setSelectedVideo({
      id: videoId,
      title: "Selected YouTube Video",
      thumbnail: getYouTubeThumbnail(videoId, 'mqdefault')
    });
  };
  
  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // IMPORTANT: This uses a mock search since the YouTube API key 
      // is often not available in deployments
      // In production, you'd need to ensure your NEXT_PUBLIC_YOUTUBE_API_KEY 
      // environment variable is properly set in Vercel
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create mock results based on search term
      const searchLower = searchTerm.toLowerCase();
      const mockResults = [];
      
      // Add some dynamic mock results based on search term
      if (searchLower.includes('amazing')) {
        mockResults.push({
          id: 'tBuIRXD8yHs',
          title: 'Amazing Grace - Choir Performance',
          description: 'A beautiful choir rendition of Amazing Grace',
          thumbnails: {
            medium: { url: getYouTubeThumbnail('tBuIRXD8yHs', 'mqdefault') }
          },
          channelTitle: 'Choir Channel'
        });
      }
      
      if (searchLower.includes('hallelujah')) {
        mockResults.push({
          id: 'LRP8d7hhpoQ',
          title: 'Hallelujah - Pentatonix',
          description: 'Pentatonix performs Hallelujah',
          thumbnails: {
            medium: { url: getYouTubeThumbnail('LRP8d7hhpoQ', 'mqdefault') }
          },
          channelTitle: 'PTX Official'
        });
      }
      
      // Include some default results regardless of search term
      mockResults.push({
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up',
        description: 'Official music video for Rick Astley - Never Gonna Give You Up',
        thumbnails: {
          medium: { url: getYouTubeThumbnail('dQw4w9WgXcQ', 'mqdefault') }
        },
        channelTitle: 'Rick Astley'
      });
      
      mockResults.push({
        id: 'fJ9rUzIMcZQ',
        title: 'Queen - Bohemian Rhapsody',
        description: 'Official music video for Queen - Bohemian Rhapsody',
        thumbnails: {
          medium: { url: getYouTubeThumbnail('fJ9rUzIMcZQ', 'mqdefault') }
        },
        channelTitle: 'Queen Official'
      });
      
      setSearchResults(mockResults);
      
      if (mockResults.length === 0) {
        setError('No videos found. Try a different search term.');
      }
    } catch (err) {
      console.error('YouTube search error:', err);
      setError('Failed to search YouTube. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select a video from search results
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    onSelectVideo({
      youtubeVideoId: video.id,
      youtubeTitle: video.title
    });
  };
  
  // Complete the selection process
  const confirmSelection = () => {
    if (!selectedVideo) {
      setError('Please select a video first');
      return;
    }
    
    onSelectVideo({
      youtubeVideoId: selectedVideo.id,
      youtubeTitle: selectedVideo.title || 'Selected YouTube Video'
    });
  };
  
  return (
    <div className="w-full rounded-lg border border-indigo-200 p-4 mt-4 bg-gradient-to-r from-indigo-50 to-blue-50">
      <h3 className="text-sm font-medium text-indigo-700 mb-3 flex items-center">
        <Youtube size={16} className="mr-1 text-red-500" />
        Find on YouTube
      </h3>
      
      {/* Direct YouTube URL input */}
      <div className="mb-3">
        <label className="block text-xs text-indigo-700 mb-1">
          Paste YouTube URL
        </label>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 text-sm border border-indigo-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            placeholder="https://www.youtube.com/watch?v=..."
            value={directVideoUrl}
            onChange={handleDirectUrlChange}
          />
          <button
            className="bg-indigo-600 text-white px-3 rounded-r-lg hover:bg-indigo-700 flex items-center"
            onClick={() => {
              const videoId = extractVideoId(directVideoUrl);
              if (videoId) previewDirectVideo(videoId);
              else setError('Invalid YouTube URL');
            }}
          >
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
      
      {/* Separator */}
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-indigo-200"></div>
        <span className="flex-shrink mx-4 text-indigo-400 text-sm">or</span>
        <div className="flex-grow border-t border-indigo-200"></div>
      </div>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-4">
        <label className="block text-xs text-indigo-700 mb-1">
          Search for a song
        </label>
        <div className="flex">
          <input
            type="text"
            className="flex-1 p-2 text-sm border border-indigo-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
            placeholder="Search for songs on YouTube..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-3 rounded-r-lg hover:bg-indigo-700 flex items-center"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
          </button>
        </div>
      </form>
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-800 text-sm p-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-indigo-700 mb-2">Results</h4>
          <div className="max-h-52 overflow-y-auto border border-indigo-100 rounded-lg bg-white">
            {searchResults.map(video => (
              <div
                key={video.id}
                className={`p-2 border-b border-indigo-100 cursor-pointer hover:bg-indigo-50 flex items-start ${
                  selectedVideo && selectedVideo.id === video.id ? 'bg-indigo-100' : ''
                }`}
                onClick={() => handleSelectVideo(video)}
              >
                <img 
                  src={video.thumbnails.medium.url} 
                  alt={video.title}
                  className="w-20 h-12 object-cover rounded mr-2"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-800 truncate">{video.title}</h5>
                  <p className="text-xs text-gray-500 truncate">{video.channelTitle}</p>
                </div>
                {selectedVideo && selectedVideo.id === video.id && (
                  <CheckCircle size={16} className="text-green-500 ml-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected video preview */}
      {selectedVideo && (
        <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
          <h4 className="text-xs font-medium text-green-700 mb-2 flex items-center">
            <CheckCircle size={14} className="mr-1" />
            Selected Video
          </h4>
          <div className="flex items-center">
            <img 
              src={selectedVideo.thumbnail} 
              alt={selectedVideo.title}
              className="w-20 h-12 object-cover rounded mr-2" 
            />
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-800 truncate">{selectedVideo.title}</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSearch;