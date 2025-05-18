import { useState, useEffect } from 'react';
import { fetchAllSongs, addSong, fetchVotesForSong } from '../lib/supabase';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../lib/youtube-api';
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
            const votes = await fetchVotesForSong(song.id);
            
            // Format the song data
            return {
              id: song.id,
              title: song.title,
              artist: song.artist,
              notes: song.notes,
              youtubeUrl: getYouTubeEmbedUrl(song.youtube_video_id),
              youtubeThumb: getYouTubeThumbnail(song.youtube_video_id),
              youtubeTitle: song.youtube_title,
              youtubeVideoId: song.youtube_video_id,
              suggestedBy: song.users.name,
              suggestedById: song.suggested_by,
              votes: votes.length,
              voters: votes.map(vote => vote.user_id),
              votedByCurrentUser: votes.some(vote => vote.user_id === user.id),
              createdAt: song.created_at
            };
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