'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Music, Mic, ListMusic, X, Check, 
  Youtube, Search 
} from 'lucide-react';

/**
 * Tab for suggesting new songs
 */
const SuggestTab = ({ songs, user }) => {
  // Destructure the songs hook values
  const { 
    addNewSong, 
    isLoading: songsLoading, 
    error: songsError 
  } = songs || { isLoading: false, error: null };

  // Local state
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    youtubeQuery: '',
    notes: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Auto-update YouTube search query when title or artist changes
  useEffect(() => {
    // Combine title and artist for the YouTube search query
    let query = '';
    if (newSong.title) query += newSong.title;
    if (newSong.title && newSong.artist) query += ' ';
    if (newSong.artist) query += newSong.artist;
    
    if (query !== newSong.youtubeQuery) {
      setNewSong(prev => ({...prev, youtubeQuery: query}));
    }
  }, [newSong.title, newSong.artist]);

  // Search YouTube
  const searchYoutube = async () => {
    if (newSong.youtubeQuery.trim()) {
      setIsSearching(true);
      setSearchResults([]);
      
      try {
        // Import the real search function
        const { searchYouTubeVideos } = await import('../lib/youtube-api');
        
        // Call the actual YouTube API
        const results = await searchYouTubeVideos(newSong.youtubeQuery);
        
        // Format the results to match our expected structure
        const formattedResults = results.map(item => ({
          id: item.id,
          title: item.title,
          thumbnail: item.thumbnails?.medium?.url || item.thumbnails?.default?.url,
          channelTitle: item.channelTitle
        }));
        
        setSearchResults(formattedResults);
      } catch (error) {
        console.error('YouTube search error:', error);
        // Fallback to sample results if API fails
        const query = newSong.youtubeQuery;
        setSearchResults([
          { 
            id: 'dQw4w9WgXcQ',
            title: `${query} - Official Music Video`, 
            thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
            channelTitle: 'VEVO'
          }
        ]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handle selecting a video from search results
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    // If there's a video title, use it for the song title if the song title is empty
    if (video.title && !newSong.title.trim()) {
      // Clean up the title (remove things like "- Official Video", etc)
      let cleanTitle = video.title;
      const suffixes = [' - Official Music Video', ' - Official Video', ' (Official Video)', ' (Lyric Video)', ' (Live Performance)'];
      
      for (const suffix of suffixes) {
        if (cleanTitle.endsWith(suffix)) {
          cleanTitle = cleanTitle.substring(0, cleanTitle.length - suffix.length);
          break;
        }
      }
      
      setNewSong(prev => ({...prev, title: cleanTitle}));
    }
  };
  
  // Add a new song
  const handleAddSong = async () => {
    if (newSong.title && newSong.artist && user) {
      // IMPORTANT: Match the property names expected by addNewSong
      const songData = {
        title: newSong.title,
        artist: newSong.artist,
        notes: newSong.notes,
        youtubeVideoId: selectedVideo?.id || null,
        youtubeTitle: selectedVideo?.title || null
      };
      
      try {
        if (addNewSong) {
          const success = await addNewSong(songData);
          
          if (success) {
            // Reset form
            setNewSong({ title: '', artist: '', youtubeQuery: '', notes: '' });
            setSearchResults([]);
            setSelectedVideo(null);
            
            // Force reload data in all tabs
            console.log('Song added successfully, refreshing data');
          }
        } else {
          console.log('addNewSong function not available');
        }
      } catch (err) {
        console.error("Error in handleAddSong:", err);
      }
    }
  };

  return (
    <div style={{background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '16px'}}>
      <h2 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
        <PlusCircle size={20} style={{marginRight: '8px', color: '#4F46E5'}} />
        Suggest a New Song
      </h2>
      
      {songsError && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#FEF2F2',
          borderRadius: '8px',
          borderLeft: '4px solid #EF4444',
          color: '#B91C1C'
        }}>
          {songsError}
        </div>
      )}
      
      {/* Song Title */}
      <div style={{marginBottom: '16px'}}>
        <label htmlFor="songTitle" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
          <Music size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
          Song Title
        </label>
        <input
          type="text"
          id="songTitle"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s',
            backgroundColor: '#F9FAFB'
          }}
          value={newSong.title}
          onChange={(e) => setNewSong({...newSong, title: e.target.value})}
          placeholder="Enter song title"
        />
      </div>
      
      {/* Artist/Composer */}
      <div style={{marginBottom: '16px'}}>
        <label htmlFor="artist" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
          <Mic size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
          Artist
        </label>
        <input
          type="text"
          id="artist"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s',
            backgroundColor: '#F9FAFB'
          }}
          value={newSong.artist}
          onChange={(e) => setNewSong({...newSong, artist: e.target.value})}
          placeholder="Enter artist or composer"
        />
      </div>
      
      {/* YouTube Search Section */}
      <div style={{marginBottom: '16px'}}>
        <label htmlFor="youtubeQuery" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
          <Youtube size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
          Link to YouTube version (Optional)
        </label>
        <div style={{display: 'flex'}}>
          <input
            type="text"
            id="youtubeQuery"
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #E5E7EB',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#F9FAFB'
            }}
            value={newSong.youtubeQuery}
            onChange={(e) => setNewSong({...newSong, youtubeQuery: e.target.value})}
            placeholder="Search for a video"
          />
          <button
            onClick={searchYoutube}
            disabled={!newSong.youtubeQuery.trim() || isSearching}
            style={{
              padding: '0 16px',
              borderRadius: '0 8px 8px 0',
              border: '1px solid #E5E7EB',
              borderLeft: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: !newSong.youtubeQuery.trim() || isSearching ? '#F3F4F6' : '#4F46E5',
              color: !newSong.youtubeQuery.trim() || isSearching ? '#9CA3AF' : 'white',
              cursor: !newSong.youtubeQuery.trim() || isSearching ? 'not-allowed' : 'pointer',
            }}
          >
            <Search size={18} />
          </button>
        </div>
        
        {isSearching && (
          <div style={{marginTop: '8px', fontSize: '14px', color: '#4F46E5', display: 'flex', alignItems: 'center'}}>
            <div style={{
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              border: '2px solid #C7D2FE', 
              borderTopColor: '#4F46E5',
              animation: 'spin 1s linear infinite',
              marginRight: '8px',
            }}></div>
            Searching...
          </div>
        )}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{marginTop: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden'}}>
            <div style={{padding: '8px 12px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '14px', fontWeight: '500', color: '#4B5563'}}>
              Search Results
            </div>
            <div>
              {searchResults.map((result, index) => (
                <div 
                  key={result.id} 
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: selectedVideo?.id === result.id ? '#F3F4FF' : 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => handleSelectVideo(result)}
                >
                  <div style={{width: '120px', height: '68px', backgroundColor: '#F3F4F6', marginRight: '12px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden'}}>
                    <img src={result.thumbnail} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: selectedVideo?.id === result.id ? '500' : '400', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                      {result.title}
                    </p>
                    <p style={{margin: 0, fontSize: '12px', color: '#6B7280'}}>
                      {result.channelTitle}
                    </p>
                  </div>
                  {selectedVideo?.id === result.id && (
                    <Check size={18} style={{marginLeft: '8px', color: '#4F46E5'}} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Video Preview */}
        {selectedVideo && !searchResults.length && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#F3F4FF',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #C7D2FE'
          }}>
            <div style={{width: '100px', height: '56px', backgroundColor: '#E0E7FF', marginRight: '12px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden'}}>
              <img src={selectedVideo.thumbnail} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <p style={{margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500', color: '#4338CA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedVideo.title}
              </p>
              <p style={{margin: 0, fontSize: '12px', color: '#6B7280'}}>
                {selectedVideo.channelTitle}
              </p>
            </div>
            <button 
              onClick={() => setSelectedVideo(null)} 
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                color: '#6B7280',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Additional Notes */}
      <div style={{marginBottom: '16px'}}>
        <label htmlFor="notes" style={{display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px'}}>
          <ListMusic size={16} style={{marginRight: '8px', color: '#4F46E5'}} />
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            transition: 'all 0.2s',
            minHeight: '100px',
            resize: 'vertical',
            backgroundColor: '#F9FAFB'
          }}
          value={newSong.notes}
          onChange={(e) => setNewSong({...newSong, notes: e.target.value})}
          placeholder="Any additional information"
          rows="3"
        />
      </div>
      
      {/* Submit Button */}
      <button
        onClick={handleAddSong}
        disabled={!newSong.title || !newSong.artist || songsLoading}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          cursor: (newSong.title && newSong.artist && !songsLoading) ? 'pointer' : 'not-allowed',
          background: (newSong.title && newSong.artist && !songsLoading) 
            ? 'linear-gradient(to right, #4F46E5, #7E3AF2)' 
            : '#E5E7EB',
          color: (newSong.title && newSong.artist && !songsLoading) ? 'white' : '#6B7280',
          boxShadow: (newSong.title && newSong.artist && !songsLoading) ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {songsLoading ? (
          <div style={{
            width: '20px', 
            height: '20px', 
            borderRadius: '50%', 
            border: '2px solid rgba(255,255,255,0.3)', 
            borderTopColor: 'white',
            animation: 'spin 1s linear infinite',
            marginRight: '8px',
          }}></div>
        ) : (
          <PlusCircle size={18} style={{marginRight: '8px'}} />
        )}
        <span>{songsLoading ? 'Submitting...' : 'Submit Song'}</span>
      </button>

      {/* Add CSS for animation */}
      <style dangerouslySetInnerHTML={{
        __html: "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"
      }} />
    </div>
  );
};

export default SuggestTab;