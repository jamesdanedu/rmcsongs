// Integrated hooks/useSongs.js with 3-suggestion limit and YouTube view count support

import { useState, useEffect, useCallback } from 'react';
import { fetchAllSongs, addSong, fetchVotesForSong, fetchPendingVotesForUser } from '../lib/supabase';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, isValidYouTubeVideoId } from '../lib/youtube-api';
import { supabaseClient } from '../lib/supabase';

/**
 * Custom hook for managing songs data
 */
export function useSongs(user) {
  const [songs, setSongs] = useState([]);
  const [pendingSongs, setPendingSongs] = useState([]); // Songs for vote tab
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for suggestion limit feature
  const [userSuggestionCount, setUserSuggestionCount] = useState(0);
  const [canSuggestMore, setCanSuggestMore] = useState(true);
  const [nextSuggestionDate, setNextSuggestionDate] = useState(null);
  
  // Maximum number of suggestions allowed in 30 days
  const MAX_SUGGESTIONS_PER_MONTH = 3;
  
  // Check if a user can suggest more songs and when they can next suggest
  const checkSuggestionLimit = useCallback(async () => {
    if (!user) return { canSuggest: false };
    
    try {
      // Get the date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Query for songs suggested by this user in the last 30 days
      const { data, error } = await supabaseClient
        .from('songs')
        .select('id, created_at')
        .eq('suggested_by', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const recentSuggestions = data || [];
      const count = recentSuggestions.length;
      
      setUserSuggestionCount(count);
      
      // If user has reached the limit, calculate when they can suggest again
      if (count >= MAX_SUGGESTIONS_PER_MONTH && recentSuggestions.length > 0) {
        // The oldest suggestion's date + 30 days = when they can suggest again
        const oldestSuggestion = new Date(recentSuggestions[0].created_at);
        const nextAvailable = new Date(oldestSuggestion);
        nextAvailable.setDate(nextAvailable.getDate() + 30);
        
        setNextSuggestionDate(nextAvailable);
        setCanSuggestMore(false);
        
        return { 
          canSuggest: false, 
          nextDate: nextAvailable, 
          suggestionsRemaining: 0 
        };
      } else {
        setNextSuggestionDate(null);
        setCanSuggestMore(true);
        
        return { 
          canSuggest: true, 
          nextDate: null, 
          suggestionsRemaining: MAX_SUGGESTIONS_PER_MONTH - count 
        };
      }
    } catch (err) {
      console.error('Error checking suggestion limit:', err);
      return { canSuggest: true }; // Allow by default if check fails
    }
  }, [user]);
  
  // Load all songs (for rankings tab)
  const loadAllSongs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check suggestion limit whenever songs are loaded
      await checkSuggestionLimit();
      
      const songsData = await fetchAllSongs();
      
      // Get vote counts for each song
      const songsWithVotes = await Promise.all(
        songsData.map(async (song) => {
          try {
            const votes = await fetchVotesForSong(song.id);
            
            // Count upvotes and downvotes separately
            const upvotes = votes.filter(vote => vote.vote_type === 'up').length;
            const downvotes = votes.filter(vote => vote.vote_type === 'down').length;
            const netVotes = upvotes - downvotes;
            
            // Validate YouTube video ID
            let youtubeUrl = '';
            let youtubeThumb = '';
            
            if (song.youtube_video_id && isValidYouTubeVideoId(song.youtube_video_id)) {
              youtubeUrl = getYouTubeEmbedUrl(song.youtube_video_id);
              youtubeThumb = getYouTubeThumbnail(song.youtube_video_id);
            } else if (song.youtube_video_id) {
              console.warn(`Invalid YouTube ID found in song "${song.title}": ${song.youtube_video_id}`);
            }
            
            // Format the song data - including YouTube view count
            return {
              id: song.id,
              title: song.title,
              artist: song.artist,
              notes: song.notes,
              youtubeUrl: youtubeUrl,
              youtubeThumb: youtubeThumb,
              youtubeTitle: song.youtube_title,
              youtubeVideoId: isValidYouTubeVideoId(song.youtube_video_id) ? song.youtube_video_id : null,
              youtubeViewCount: song.youtube_view_count || 0, // Include YouTube view count
              suggestedBy: song.suggesterName || 'Anonymous',
              suggestedById: song.suggested_by,
              upvotes: upvotes,
              downvotes: downvotes,
              netVotes: netVotes,
              totalVotes: upvotes + downvotes,
              votes: netVotes, // For backward compatibility with ranking display
              createdAt: song.created_at
            };
          } catch (err) {
            console.error(`Error processing song ${song.id}:`, err);
            // Return a minimal valid song object if there was an error
            return {
              id: song.id,
              title: song.title || 'Unknown Song',
              artist: song.artist || 'Unknown Artist',
              notes: song.notes || '',
              youtubeUrl: '',
              youtubeThumb: '',
              youtubeTitle: '',
              youtubeVideoId: null,
              youtubeViewCount: 0,
              suggestedBy: song.suggesterName || 'Anonymous',
              suggestedById: song.suggested_by,
              upvotes: 0,
              downvotes: 0,
              netVotes: 0,
              totalVotes: 0,
              votes: 0,
              createdAt: song.created_at || new Date().toISOString()
            };
          }
        })
      );
      
      setSongs(songsWithVotes);
    } catch (err) {
      console.error('Error loading all songs:', err);
      setError('Failed to load songs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, checkSuggestionLimit]);

  // Load pending songs (for vote tab)
  const loadPendingSongs = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Loading pending songs for vote tab');
      const pendingVotesData = await fetchPendingVotesForUser(user.id);
      
      // Transform the data structure
      const pendingSongsFormatted = pendingVotesData.map(voteRecord => {
        const song = voteRecord.songs;
        
        // Validate YouTube video ID
        let youtubeUrl = '';
        let youtubeThumb = '';
        
        if (song.youtube_video_id && isValidYouTubeVideoId(song.youtube_video_id)) {
          youtubeUrl = getYouTubeEmbedUrl(song.youtube_video_id);
          youtubeThumb = getYouTubeThumbnail(song.youtube_video_id);
        }
        
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          notes: song.notes,
          youtubeUrl: youtubeUrl,
          youtubeThumb: youtubeThumb,
          youtubeTitle: song.youtube_title,
          youtubeVideoId: isValidYouTubeVideoId(song.youtube_video_id) ? song.youtube_video_id : null,
          youtubeViewCount: song.youtube_view_count || 0, // Include YouTube view count
          suggestedBy: song.users?.name || 'Anonymous',
          suggestedById: song.suggested_by,
          voteStatus: 'pending', // All these songs are pending for this user
          createdAt: song.created_at
        };
      });
      
      console.log(`Loaded ${pendingSongsFormatted.length} pending songs for vote tab`);
      setPendingSongs(pendingSongsFormatted);
    } catch (err) {
      console.error('Error loading pending songs:', err);
      setError('Failed to load songs for voting. Please try again.');
    }
  }, [user]);
  
  // Load both all songs and pending songs
  const loadSongs = useCallback(async () => {
    await Promise.all([
      loadAllSongs(),
      loadPendingSongs()
    ]);
  }, [loadAllSongs, loadPendingSongs]);
  
  // Load songs on mount and when user changes
  useEffect(() => {
    if (user) {
      loadSongs();
    }
  }, [user, loadSongs]);
  
  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up Supabase realtime subscriptions');
    
    // Subscribe to realtime changes
    const songsSubscription = supabaseClient
      .channel('songs_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' }, 
        payload => {
          console.log('Supabase songs update:', payload);
          loadSongs();
        }
      )
      .subscribe();
      
    const votesSubscription = supabaseClient
      .channel('votes_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        payload => {
          console.log('Supabase votes update:', payload);
          loadSongs();
        }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      console.log('Cleaning up Supabase subscriptions');
      supabaseClient.removeChannel(songsSubscription);
      supabaseClient.removeChannel(votesSubscription);
    };
  }, [user, loadSongs]);
  
  // Function to add a new song - now including YouTube view count
  const addNewSong = async (songData) => {
    if (!user) {
      setError('You must be logged in to add a song');
      return null;
    }
    
    // Check if the user can suggest more songs
    const { canSuggest, nextDate, suggestionsRemaining } = await checkSuggestionLimit();
    
    if (!canSuggest) {
      const formattedDate = nextDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
      
      setError(`You've reached your limit of ${MAX_SUGGESTIONS_PER_MONTH} song suggestions in a 30-day period. You can suggest another song on ${formattedDate}.`);
      return null;
    }
    
    try {
      // Validate YouTube video ID if present
      if (songData.youtubeVideoId && !isValidYouTubeVideoId(songData.youtubeVideoId)) {
        setError('Invalid YouTube video ID');
        return null;
      }
      
      const newSong = await addSong({
        title: songData.title,
        artist: songData.artist,
        notes: songData.notes,
        youtube_video_id: songData.youtubeVideoId,
        youtube_title: songData.youtubeTitle,
        youtube_view_count: songData.youtubeViewCount || null, // Include YouTube view count
        suggested_by: user.id
      });
      
      // Force reload songs to ensure UI is updated
      await loadSongs();
      
      // After adding, refresh the suggestion count
      await checkSuggestionLimit();
      
      return newSong;
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song. Please try again.');
      return null;
    }
  };
  
  // Get songs for vote tab (only pending songs)
  const getSongsToVote = () => {
    if (!user) return [];
    
    console.log(`Songs available for voting: ${pendingSongs.length} pending songs`);
    return pendingSongs;
  };
  
  // Get songs sorted by net votes and using YouTube view count as tiebreaker
  const getSortedSongs = () => {
    // First sort by netVotes, then by YouTube view count, then by difficulty if available
    const sorted = [...songs].sort((a, b) => {
      // Primary sort by net votes (upvotes minus downvotes)
      const votesDiff = b.netVotes - a.netVotes;
      
      // If votes are equal, use YouTube view count as tiebreaker
      if (votesDiff === 0) {
        return (b.youtubeViewCount || 0) - (a.youtubeViewCount || 0);
      }
      
      return votesDiff;
    });
    
    // Apply dense ranking algorithm
    let currentRank = 1;
    let previousVotes = sorted.length > 0 ? sorted[0].netVotes : 0;
    
    return sorted.map((song, index) => {
      // If this song has fewer votes than the previous one, increment the rank
      if (song.netVotes < previousVotes) {
        currentRank = index + 1;
        previousVotes = song.netVotes;
      }
      
      return {
        ...song,
        rank: currentRank
      };
    });
  };
  
  return {
    songs,              // All songs with vote counts (for rankings tab)
    pendingSongs,       // Songs pending user vote (for vote tab)
    isLoading,
    error,
    addNewSong,
    getSongsToVote,     // Returns pendingSongs
    getSortedSongs,     // Returns songs sorted by net votes with dense ranking
    loadSongs,          // Export loadSongs so it can be called from outside
    
    // New exports for suggestion limit feature
    canSuggestMore,
    userSuggestionCount,
    nextSuggestionDate,
    suggestionsRemaining: MAX_SUGGESTIONS_PER_MONTH - userSuggestionCount,
    maxSuggestionsPerMonth: MAX_SUGGESTIONS_PER_MONTH
  };
}