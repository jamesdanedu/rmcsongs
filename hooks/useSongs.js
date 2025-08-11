// hooks/useSongs.js
import { useState, useEffect, useCallback } from 'react';
import { fetchAllSongs, addSong } from '../lib/supabase';
import { getYouTubeEmbedUrl, getYouTubeThumbnail, isValidYouTubeVideoId } from '../lib/youtube-api';
import { supabaseClient } from '../lib/supabase';
import { 
  cacheSongs, 
  getCachedSongs, 
  queueOfflineAction, 
  getOfflineActions,
  applyOfflineChangesToSongs,
  getPendingActionCount,
  removeOfflineAction
} from '../utils/offlineStorage';
import { requestBackgroundSync } from '../utils/serviceWorker';

/**
 * Custom hook for managing songs data with offline support
 */
export function useSongs(user) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineActionsCount, setOfflineActionsCount] = useState(0);
  
  // Check online status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      // Store last online timestamp
      localStorage.setItem('rmc_last_online', Date.now().toString());
      // Try to sync when coming back online
      requestBackgroundSync('sync-songs').catch(err => {
        console.warn('Background sync request failed:', err);
      });
    };
    
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Update pending actions count
  useEffect(() => {
    const updatePendingCount = () => {
      const count = getPendingActionCount();
      setOfflineActionsCount(count);
    };
    
    // Update immediately
    updatePendingCount();
    
    // Set up interval for periodic updates
    const interval = setInterval(updatePendingCount, 5000);
    
    // Listen for offline action events
    const handleActionEvents = () => updatePendingCount();
    
    window.addEventListener('offline-action-queued', handleActionEvents);
    window.addEventListener('offline-action-updated', handleActionEvents);
    window.addEventListener('offline-action-removed', handleActionEvents);
    window.addEventListener('offline-actions-cleaned', handleActionEvents);
    window.addEventListener('sw-sync-complete', handleActionEvents);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('offline-action-queued', handleActionEvents);
      window.removeEventListener('offline-action-updated', handleActionEvents);
      window.removeEventListener('offline-action-removed', handleActionEvents);
      window.removeEventListener('offline-actions-cleaned', handleActionEvents);
      window.removeEventListener('sw-sync-complete', handleActionEvents);
    };
  }, []);
  
  // Function to load songs
  const loadSongs = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let songsData;
      
      if (!isOnline) {
        // Offline: Use cached data
        songsData = getCachedSongs();
        if (!songsData) {
          setError('You are offline and no cached songs are available.');
          setIsLoading(false);
          return;
        }
        
        // Apply any pending offline changes to the cached data
        songsData = applyOfflineChangesToSongs(songsData, user);
      } else {
        // Online: Fetch from API
        songsData = await fetchAllSongs();
        
        // Process songs to add YouTube info and format for use
        songsData = await Promise.all(songsData.map(async (song) => {
          try {
            // Validate YouTube video ID
            let youtubeUrl = '';
            let youtubeThumb = '';
            
            if (song.youtube_video_id && isValidYouTubeVideoId(song.youtube_video_id)) {
              youtubeUrl = getYouTubeEmbedUrl(song.youtube_video_id);
              youtubeThumb = getYouTubeThumbnail(song.youtube_video_id);
            }
            
            // Get votes for this song
            const votes = song.votes || [];
            
            // Format the song data
            return {
              id: song.id,
              title: song.title,
              artist: song.artist,
              notes: song.notes,
              youtubeUrl,
              youtubeThumb,
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
        }));
        
        // Cache songs for offline use
        cacheSongs(songsData);
        
        // Apply any pending offline changes to the fetched data
        songsData = applyOfflineChangesToSongs(songsData, user);
      }
      
      setSongs(songsData);
    } catch (err) {
      console.error('Error loading songs:', err);
      
      // Try to use cached data if online fetch fails
      const cachedSongs = getCachedSongs();
      if (cachedSongs) {
        const processedSongs = applyOfflineChangesToSongs(cachedSongs, user);
        setSongs(processedSongs);
        setError('Using cached data. Some information may be outdated.');
      } else {
        setError('Failed to load songs. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, isOnline]);
  
  // Load songs on mount and when dependencies change
  useEffect(() => {
    if (user) {
      loadSongs();
    }
  }, [user, loadSongs]);
  
  // Set up real-time subscription when online
  useEffect(() => {
    if (!user || !isOnline) return;
    
    // Subscribe to realtime changes
    const subscription = supabaseClient
      .channel('songs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'songs' }, 
        () => {
          // Reload songs when any change occurs
          loadSongs();
        }
      )
      .subscribe();
    
    // Cleanup subscription
    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, [user, isOnline, loadSongs]);
  
  // Process offline actions when coming back online
  useEffect(() => {
    if (!isOnline || !user) return;
    
    const processOfflineActions = async () => {
      const pendingActions = getOfflineActions('pending');
      
      if (pendingActions.length === 0) return;
      
      // Request background sync
      const syncRequested = await requestBackgroundSync('sync-songs');
      if (!syncRequested) {
        console.warn('Background sync not supported, manually processing actions');
        
        // Process each action manually if background sync not supported
        for (const action of pendingActions) {
          try {
            if (action.type === 'ADD_SONG') {
              await addSong({
                title: action.data.title,
                artist: action.data.artist,
                notes: action.data.notes || null,
                youtube_video_id: action.data.youtubeVideoId || null,
                youtube_title: action.data.youtubeTitle || null,
                suggested_by: user.id
              });
              
              // Remove from offline queue
              removeOfflineAction(action.id);
            }
            // Note: Vote actions are handled by useVotes hook
          } catch (error) {
            console.error(`Error processing offline action ${action.id}:`, error);
          }
        }
        
        // Reload songs after processing
        await loadSongs();
      }
    };
    
    processOfflineActions();
  }, [isOnline, user, loadSongs]);
  
  // Function to add a new song with offline support
  const addNewSong = async (songData) => {
    if (!user) {
      setError('You must be logged in to add a song');
      return false;
    }
    
    try {
      if (isOnline) {
        // Online: Add directly to database
        await addSong({
          title: songData.title,
          artist: songData.artist,
          notes: songData.notes || null,
          youtube_video_id: songData.youtubeVideoId || null,
          youtube_title: songData.youtubeTitle || null,
          suggested_by: user.id
        });
        
        // Reload songs to ensure UI is updated
        await loadSongs();
      } else {
        // Offline: Queue for later
        const actionId = queueOfflineAction({
          type: 'ADD_SONG',
          data: {
            title: songData.title,
            artist: songData.artist,
            notes: songData.notes,
            youtubeVideoId: songData.youtubeVideoId,
            youtubeTitle: songData.youtubeTitle,
            userId: user.id
          }
        });
        
        if (!actionId) {
          throw new Error('Failed to queue song for offline submission');
        }
        
        // Reload songs to update UI with the new offline song
        await loadSongs();
      }
      
      return true;
    } catch (err) {
      console.error('Error adding song:', err);
      setError('Failed to add song. Please try again.');
      return false;
    }
  };
  
  // Function to get songs that haven't been voted on by the current user
  const getSongsToVote = useCallback(() => {
    if (!user) return [];
    
    return songs.filter(song => {
      // Skip songs that have been voted on
      const hasVoted = song.votedByCurrentUser || 
                       (song.voters && song.voters.includes(user.id));
      
      return !hasVoted;
    });
  }, [songs, user]);
  
  // Function to get songs sorted by votes
  const getSortedSongs = useCallback(() => {
    return [...songs].sort((a, b) => {
      // Sort by votes (descending)
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      
      // If votes are equal, sort by creation date (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [songs]);
  
  return {
    songs,
    isLoading,
    error,
    isOnline,
    offlineActionsCount,
    addNewSong,
    getSongsToVote,
    getSortedSongs,
    loadSongs
  };
}
