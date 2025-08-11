// hooks/useVotes.js
import { useState, useCallback, useEffect } from 'react';
import { addVote } from '../lib/supabase';
import { 
  queueOfflineAction, 
  getOfflineActions, 
  removeOfflineAction 
} from '../utils/offlineStorage';
import { requestBackgroundSync } from '../utils/serviceWorker';

/**
 * Custom hook for handling song votes with offline support
 * 
 * @param {Object} user - Current user object
 * @param {boolean} isOnline - Current online status
 * @param {function} loadSongs - Function to reload songs data
 * @returns {Object} - Vote management functions and state
 */
export function useVotes(user, isOnline, loadSongs) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  
  // Process offline votes when coming back online
  useEffect(() => {
    if (!isOnline || !user) return;
    
    const processOfflineVotes = async () => {
      const pendingActions = getOfflineActions('pending')
        .filter(action => action.type === 'VOTE');
      
      if (pendingActions.length === 0) return;
      
      // Request background sync
      const syncRequested = await requestBackgroundSync('sync-songs');
      if (!syncRequested) {
        console.warn('Background sync not supported, manually processing votes');
        
        // Process each vote manually if background sync not supported
        for (const action of pendingActions) {
          try {
            if (action.type === 'VOTE') {
              await addVote(action.data.songId, action.data.userId);
              
              // Remove from offline queue
              removeOfflineAction(action.id);
            }
          } catch (error) {
            console.error(`Error processing offline vote ${action.id}:`, error);
            
            // If it's a duplicate vote, remove from queue
            if (error.code === '23505') {
              removeOfflineAction(action.id);
            }
          }
        }
        
        // Reload songs after processing
        if (typeof loadSongs === 'function') {
          await loadSongs();
        }
      }
    };
    
    processOfflineVotes();
  }, [isOnline, user, loadSongs]);
  
  /**
   * Vote for a song with offline support
   * @param {string} songId - ID of the song to vote for
   * @returns {Promise<boolean>} - Whether the vote was successful
   */
  const voteForSong = useCallback(async (songId) => {
    if (!user) {
      setError('You must be logged in to vote');
      return false;
    }
    
    setIsVoting(true);
    setError(null);
    
    try {
      if (isOnline) {
        // Online: Vote directly
        await addVote(songId, user.id);
      } else {
        // Offline: Queue the vote
        const actionId = queueOfflineAction({
          type: 'VOTE',
          data: {
            songId,
            userId: user.id
          }
        });
        
        if (!actionId) {
          throw new Error('Failed to queue vote for offline processing');
        }
      }
      
      // Reload songs to update UI
      if (typeof loadSongs === 'function') {
        await loadSongs();
      }
      
      return true;
    } catch (err) {
      console.error('Error voting for song:', err);
      
      // If it's a duplicate vote error, don't show an error to the user
      if (err.code === '23505') {
        // Reload songs to make sure UI is in sync
        if (typeof loadSongs === 'function') {
          await loadSongs();
        }
        return true;
      }
      
      setError('Failed to vote. Please try again.');
      return false;
    } finally {
      setIsVoting(false);
    }
  }, [user, isOnline, loadSongs]);
  
  /**
   * Check if user has already voted for a song
   * @param {string} songId - ID of the song to check
   * @returns {boolean} - Whether the user has voted for this song
   */
  const hasVotedForSong = useCallback((songId) => {
    if (!user) return false;
    
    // Check offline votes
    const pendingVotes = getOfflineActions('pending')
      .filter(action => 
        action.type === 'VOTE' && 
        action.data.songId === songId && 
        action.data.userId === user.id
      );
    
    return pendingVotes.length > 0;
  }, [user]);
  
  return {
    isVoting,
    error,
    voteForSong,
    hasVotedForSong
  };
}
