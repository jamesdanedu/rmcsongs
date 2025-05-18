import { useState, useEffect } from 'react';
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
  
  // Load songs on mount and when user changes
  useEffect(() => {
    if (!user) return;
    
    const loadSongs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const songsData = await fetchAllSongs();
        
        // Get votes for each song
        const songsWithVotes = await Promise.all(
          songsData.map(async (song) => {
            try {
              const votes = await fetchVotesForSong(song.id);
              
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
                suggestedBy: song.users?.name || 'Anonymous',
                suggestedById: song.suggested_by,
                votes: votes.length,
                voters: votes.map(vote => vote.user_id),
                votedByCurrentUser: votes.some(vote => vote.user_id === user.id),
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
                suggestedBy: song.users?.name || 'Anonymous',
                suggestedById: song.suggested_by,
                votes: 0,
                voters: [],
                votedByCurrentUser: false,
                createdAt: song.created_at || new Date().toISOString()
              };
            }
          })
        );
        
        setSongs(songsWithVotes);
      } catch (err) {
        console.error('Error loading songs:', err);
        setError('Failed to load songs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSongs();
    
    // Subscribe to realtime changes
    const songsSubscription = supabaseClient
      .channel('songs_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' }, 
        () => { loadSongs(); }
      )
      .subscribe();
      
    const votesSubscription = supabaseClient
      .channel('votes_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => { loadSongs(); }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      supabaseClient.removeChannel(songsSubscription);
      supabaseClient.removeChannel(votesSubscription);
    };
  }, [user]);
  
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
      
      return newSong;
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song. Please try again.');
      return null;
    }
  };
  
  // Get songs that the current user hasn't voted on yet
  const getSongsToVote = () => {
    if (!user) return [];
    return songs.filter(song => !song.votedByCurrentUser);
  };
  
  // Get songs sorted by votes
  const getSortedSongs = () => {
    return [...songs].sort((a, b) => b.votes - a.votes);
  };
  
  return {
    songs,
    isLoading,
    error,
    addNewSong,
    getSongsToVote,
    getSortedSongs
  };
}