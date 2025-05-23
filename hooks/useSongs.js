// Updated hooks/useSongs.js 

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
  
  // Load all songs (for rankings tab)
  const loadAllSongs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
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
            
            // Format the song data
            return {
              id: song.id,
              title: song.title,
              artist: song.artist,
              notes: song.notes,
              youtubeUrl: youtubeUrl,
              youtubeThumb: youtubeThumb,
              youtubeTitle: song.youtube_title,
              youtubeVideoId: isValidYouTubeVideoId(song.youtube_video_id) ? song.youtube_video_id : null,
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
  }, [user]);

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
  
  // Function to add a new song
  const addNewSong = async (songData) => {
    if (!user) {
      setError('You must be logged in to add a song');
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
        suggested_by: user.id
      });
      
      // Force reload songs to ensure UI is updated
      await loadSongs();
      
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
  
  // Get songs sorted by net votes (for rankings)
  const getSortedSongs = () => {
    return [...songs].sort((a, b) => b.netVotes - a.netVotes);
  };
  
  return {
    songs,              // All songs with vote counts (for rankings tab)
    pendingSongs,       // Songs pending user vote (for vote tab)
    isLoading,
    error,
    addNewSong,
    getSongsToVote,     // Returns pendingSongs
    getSortedSongs,     // Returns songs sorted by net votes
    loadSongs           // Export loadSongs so it can be called from outside
  };
}