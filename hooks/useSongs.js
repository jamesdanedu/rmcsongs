import { useState, useEffect, useCallback } from 'react';
import { fetchAllSongs, addSong, fetchVotesForSong } from '../lib/supabase';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, isValidYouTubeVideoId } from '../lib/youtube-api';
import { supabaseClient } from '../lib/supabase';

/**
 * Custom hook for managing songs data
 */
export function useSongs(user) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Helper function to safely ensure votes is an array
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data === null || data === undefined) return [];
    // If it's an object with a length property, try to convert
    if (typeof data === 'object' && typeof data.length === 'number') {
      try {
        return Array.from(data);
      } catch (e) {
        console.warn('Failed to convert data to array:', data);
        return [];
      }
    }
    console.warn('Unexpected votes data type:', typeof data, data);
    return [];
  };
  
  // Load songs function - defined as useCallback so it can be used in dependencies
  const loadSongs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading songs for user:', user.id);
      const songsData = await fetchAllSongs();
      console.log('Raw songs data from database:', songsData);
      
      if (!Array.isArray(songsData)) {
        console.warn('Songs data is not an array:', songsData);
        setSongs([]);
        return;
      }

      // Process each song with better error handling
      const songsWithVotes = await Promise.all(
        songsData.map(async (song, index) => {
          try {
            console.log(`Processing song ${index + 1}/${songsData.length}: ${song.title} (ID: ${song.id})`);
            
            // Fetch votes with error handling
            let votes = [];
            try {
              const votesData = await fetchVotesForSong(song.id);
              votes = ensureArray(votesData);
              console.log(`Votes for song ${song.id}:`, votes);
            } catch (voteError) {
              console.error(`Error fetching votes for song ${song.id}:`, voteError);
              votes = [];
            }
            
            // Validate YouTube video ID
            let youtubeUrl = '';
            let youtubeThumb = '';
            
            if (song.youtube_video_id && isValidYouTubeVideoId(song.youtube_video_id)) {
              youtubeUrl = getYouTubeEmbedUrl(song.youtube_video_id);
              youtubeThumb = getYouTubeThumbnail(song.youtube_video_id);
            } else if (song.youtube_video_id) {
              console.warn(`Invalid YouTube ID found in song "${song.title}": ${song.youtube_video_id}`);
            }
            
            // Safely get suggester name
            let suggestedBy = 'Anonymous';
            if (song.suggesterName) {
              suggestedBy = song.suggesterName;
            } else if (song.users?.name) {
              suggestedBy = song.users.name;
            }
            
            // Create the song object with safe data access
            const processedSong = {
              id: song.id,
              title: song.title || 'Untitled',
              artist: song.artist || 'Unknown Artist',
              notes: song.notes || '',
              youtubeUrl: youtubeUrl,
              youtubeThumb: youtubeThumb,
              youtubeTitle: song.youtube_title || '',
              youtubeVideoId: isValidYouTubeVideoId(song.youtube_video_id) ? song.youtube_video_id : null,
              suggestedBy: suggestedBy,
              suggestedById: song.suggested_by,
              votes: votes.length,
              voters: votes.map(vote => vote.user_id || vote.userId).filter(Boolean),
              votedByCurrentUser: votes.some(vote => (vote.user_id || vote.userId) === user.id),
              createdAt: song.created_at || new Date().toISOString()
            };
            
            console.log(`Successfully processed song: ${processedSong.title}`, processedSong);
            return processedSong;
            
          } catch (err) {
            console.error(`Error processing song ${song.id}:`, err);
            console.error('Song data that caused error:', song);
            
            // Return a minimal valid song object if there was an error
            return {
              id: song.id || `error-${Date.now()}-${Math.random()}`,
              title: song.title || 'Error Loading Song',
              artist: song.artist || 'Unknown Artist',
              notes: song.notes || '',
              youtubeUrl: '',
              youtubeThumb: '',
              youtubeTitle: '',
              youtubeVideoId: null,
              suggestedBy: 'Unknown',
              suggestedById: song.suggested_by,
              votes: 0,
              voters: [],
              votedByCurrentUser: false,
              createdAt: song.created_at || new Date().toISOString()
            };
          }
        })
      );
      
      console.log('Final processed songs:', songsWithVotes);
      setSongs(songsWithVotes);
      
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs. Please try again.');
      setSongs([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load songs on mount and when user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, loading songs for:', user);
      loadSongs();
    } else {
      console.log('No user, clearing songs');
      setSongs([]);
    }
  }, [user, loadSongs]);
  
  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up Supabase realtime subscriptions for user:', user.id);
    
    // Subscribe to realtime changes
    const songsSubscription = supabaseClient
      .channel('songs_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' }, 
        payload => {
          console.log('Supabase songs update received:', payload);
          // Debounce the reload to avoid excessive calls
          setTimeout(() => loadSongs(), 1000);
        }
      )
      .subscribe();
      
    const votesSubscription = supabaseClient
      .channel('votes_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        payload => {
          console.log('Supabase votes update received:', payload);
          // Debounce the reload to avoid excessive calls
          setTimeout(() => loadSongs(), 1000);
        }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up Supabase subscriptions');
      try {
        supabaseClient.removeChannel(songsSubscription);
        supabaseClient.removeChannel(votesSubscription);
      } catch (err) {
        console.warn('Error cleaning up subscriptions:', err);
      }
    };
  }, [user, loadSongs]);
  
  // Function to add a new song
  const addNewSong = async (songData) => {
    if (!user) {
      setError('You must be logged in to add a song');
      return false;
    }
    
    try {
      console.log('Adding new song:', songData);
      
      // Validate required fields
      if (!songData.title || !songData.artist) {
        setError('Title and artist are required');
        return false;
      }
      
      // Validate YouTube video ID if present
      if (songData.youtubeVideoId && !isValidYouTubeVideoId(songData.youtubeVideoId)) {
        setError('Invalid YouTube video ID');
        return false;
      }
      
      const newSongData = {
        title: songData.title.trim(),
        artist: songData.artist.trim(),
        notes: songData.notes ? songData.notes.trim() : null,
        youtube_video_id: songData.youtubeVideoId || null,
        youtube_title: songData.youtubeTitle || null,
        suggested_by: user.id
      };
      
      console.log('Sending song data to database:', newSongData);
      const newSong = await addSong(newSongData);
      console.log('Song added successfully:', newSong);
      
      // Reload songs to ensure UI is updated
      await loadSongs();
      
      return true;
    } catch (err) {
      console.error('Error adding song:', err);
      setError(`Failed to add song: ${err.message || 'Unknown error'}`);
      return false;
    }
  };
  
  // Get songs that the current user hasn't voted on yet
  const getSongsToVote = () => {
    if (!user || !Array.isArray(songs)) return [];
    
    console.log('Getting songs to vote for user:', user.id);
    console.log('Total songs:', songs.length);
    
    const nonVotedSongs = songs.filter(song => {
      const hasVoted = song.votedByCurrentUser || 
                       (Array.isArray(song.voters) && song.voters.includes(user.id));
                       
      console.log(`Song "${song.title}" - hasVoted: ${hasVoted}, votedByCurrentUser: ${song.votedByCurrentUser}, voters: [${song.voters}]`);
      
      return !hasVoted;
    });
    
    console.log('Songs available for voting:', nonVotedSongs.length);
    return nonVotedSongs;
  };
  
  // Get songs sorted by votes
  const getSortedSongs = () => {
    if (!Array.isArray(songs)) return [];
    return [...songs].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  };
  
  return {
    songs: Array.isArray(songs) ? songs : [],
    isLoading,
    error,
    addNewSong,
    getSongsToVote,
    getSortedSongs,
    loadSongs  // Export loadSongs so it can be called from outside
  };
}