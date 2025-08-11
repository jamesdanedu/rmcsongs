// utils/offlineStorage.js
// Utilities for managing offline data storage

/**
 * Cache the songs data in localStorage for offline access
 * @param {Array} songs - Array of song objects
 * @returns {boolean} Whether the caching was successful
 */
export function cacheSongs(songs) {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem('rmc_songs_cache', JSON.stringify({
      timestamp: Date.now(),
      data: songs
    }));
    return true;
  } catch (error) {
    console.error('Failed to cache songs:', error);
    return false;
  }
}

/**
 * Retrieve cached songs from localStorage
 * @param {number} maxAge - Maximum age of cache in milliseconds (default: 24 hours)
 * @returns {Array|null} - Cached songs or null if none found or cache is too old
 */
export function getCachedSongs(maxAge = 24 * 60 * 60 * 1000) {
  if (typeof window === 'undefined') return null;
  
  try {
    const cachedData = localStorage.getItem('rmc_songs_cache');
    if (!cachedData) return null;
    
    const { timestamp, data } = JSON.parse(cachedData);
    
    // Check if cache is too old
    if (Date.now() - timestamp > maxAge) {
      console.log('Cache is too old, returning null');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to retrieve cached songs:', error);
    return null;
  }
}

/**
 * Queue an offline action to be performed when back online
 * @param {Object} action - The action to queue
 * @param {string} action.type - Action type ('ADD_SONG', 'VOTE', etc.)
 * @param {Object} action.data - Action data
 * @returns {string|null} The ID of the queued action, or null if queuing failed
 */
export function queueOfflineAction(action) {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get current queue
    const queueString = localStorage.getItem('rmc_offline_actions') || '[]';
    const queue = JSON.parse(queueString);
    
    // Generate a unique ID for this action
    const actionId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    
    // Add action with metadata
    const queuedAction = {
      id: actionId,
      type: action.type,
      data: action.data,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    };
    
    queue.push(queuedAction);
    
    // Save back to storage
    localStorage.setItem('rmc_offline_actions', JSON.stringify(queue));
    
    // Also try to store in the cache for service worker access
    storeOfflineActionsInCache(queue).catch(err => {
      console.warn('Failed to store offline actions in cache:', err);
    });
    
    // Dispatch event for any listeners
    window.dispatchEvent(new CustomEvent('offline-action-queued', { 
      detail: { action: queuedAction, queueLength: queue.length }
    }));
    
    return actionId;
  } catch (error) {
    console.error('Failed to queue offline action:', error);
    return null;
  }
}

/**
 * Get all queued offline actions
 * @param {string|null} status - Filter by status ('pending', 'completed', 'failed', null for all)
 * @returns {Array} Array of queued actions
 */
export function getOfflineActions(status = null) {
  if (typeof window === 'undefined') return [];
  
  try {
    const queueString = localStorage.getItem('rmc_offline_actions') || '[]';
    const queue = JSON.parse(queueString);
    
    if (status === null) return queue;
    
    return queue.filter(action => action.status === status);
  } catch (error) {
    console.error('Failed to get offline actions:', error);
    return [];
  }
}

/**
 * Update the status of an offline action
 * @param {string} actionId - ID of the action to update
 * @param {string} status - New status ('completed', 'failed', 'pending')
 * @param {Object} result - Optional result data
 * @returns {boolean} Whether the update was successful
 */
export function updateOfflineAction(actionId, status, result = null) {
  if (typeof window === 'undefined') return false;
  
  try {
    const queueString = localStorage.getItem('rmc_offline_actions') || '[]';
    const queue = JSON.parse(queueString);
    
    // Find the action
    const actionIndex = queue.findIndex(action => action.id === actionId);
    if (actionIndex === -1) return false;
    
    // Update the action
    queue[actionIndex] = {
      ...queue[actionIndex],
      status,
      result,
      updatedAt: Date.now()
    };
    
    // If it failed, increment retry count
    if (status === 'failed') {
      queue[actionIndex].retries = (queue[actionIndex].retries || 0) + 1;
    }
    
    // Save back to storage
    localStorage.setItem('rmc_offline_actions', JSON.stringify(queue));
    
    // Update in cache for service worker
    storeOfflineActionsInCache(queue).catch(err => {
      console.warn('Failed to update offline actions in cache:', err);
    });
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('offline-action-updated', { 
      detail: { 
        action: queue[actionIndex], 
        queueLength: queue.filter(a => a.status === 'pending').length 
      }
    }));
    
    return true;
  } catch (error) {
    console.error('Failed to update offline action:', error);
    return false;
  }
}

/**
 * Remove an action from the offline queue
 * @param {string} actionId - ID of the action to remove
 * @returns {boolean} Whether the removal was successful
 */
export function removeOfflineAction(actionId) {
  if (typeof window === 'undefined') return false;
  
  try {
    const queueString = localStorage.getItem('rmc_offline_actions') || '[]';
    const queue = JSON.parse(queueString);
    
    // Filter out the action
    const newQueue = queue.filter(action => action.id !== actionId);
    
    // No change, action wasn't found
    if (newQueue.length === queue.length) return false;
    
    // Save back to storage
    localStorage.setItem('rmc_offline_actions', JSON.stringify(newQueue));
    
    // Update in cache for service worker
    storeOfflineActionsInCache(newQueue).catch(err => {
      console.warn('Failed to update offline actions in cache after removal:', err);
    });
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('offline-action-removed', { 
      detail: { actionId, queueLength: newQueue.filter(a => a.status === 'pending').length }
    }));
    
    return true;
  } catch (error) {
    console.error('Failed to remove offline action:', error);
    return false;
  }
}

/**
 * Clean up completed or failed actions from the queue
 * @param {Array} statusesToRemove - Array of statuses to remove ('completed', 'failed')
 * @param {number} maxAge - Maximum age in milliseconds for actions to keep
 * @returns {number} Number of actions removed
 */
export function cleanupOfflineActions(statusesToRemove = ['completed'], maxAge = 7 * 24 * 60 * 60 * 1000) {
  if (typeof window === 'undefined') return 0;
  
  try {
    const queueString = localStorage.getItem('rmc_offline_actions') || '[]';
    const queue = JSON.parse(queueString);
    
    const now = Date.now();
    const oldQueue = [...queue];
    
    // Filter out actions with the specified statuses or that are too old
    const newQueue = queue.filter(action => {
      // Keep actions that aren't in the statusesToRemove list
      if (!statusesToRemove.includes(action.status)) {
        // But still remove if they're too old (and not pending)
        if (action.status !== 'pending' && now - action.timestamp > maxAge) {
          return false;
        }
        return true;
      }
      return false;
    });
    
    // Save back to storage
    localStorage.setItem('rmc_offline_actions', JSON.stringify(newQueue));
    
    // Update in cache for service worker
    storeOfflineActionsInCache(newQueue).catch(err => {
      console.warn('Failed to update offline actions in cache after cleanup:', err);
    });
    
    const removedCount = oldQueue.length - newQueue.length;
    
    // Dispatch event if any were removed
    if (removedCount > 0) {
      window.dispatchEvent(new CustomEvent('offline-actions-cleaned', { 
        detail: { 
          removedCount, 
          queueLength: newQueue.filter(a => a.status === 'pending').length 
        }
      }));
    }
    
    return removedCount;
  } catch (error) {
    console.error('Failed to cleanup offline actions:', error);
    return 0;
  }
}

/**
 * Store offline actions in the cache for service worker access
 * @param {Array} actions - Array of offline actions
 * @returns {Promise<void>}
 */
async function storeOfflineActionsInCache(actions) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  
  try {
    const cache = await caches.open('rmcsongs-offline-data');
    await cache.put(
      'offline-actions',
      new Response(JSON.stringify(actions), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch (error) {
    console.error('Failed to store offline actions in cache:', error);
    throw error;
  }
}

/**
 * Get the count of pending offline actions
 * @returns {number} Count of pending actions
 */
export function getPendingActionCount() {
  if (typeof window === 'undefined') return 0;
  
  try {
    const actions = getOfflineActions('pending');
    return actions.length;
  } catch (error) {
    console.error('Failed to get pending action count:', error);
    return 0;
  }
}

/**
 * Apply offline changes to cached songs
 * @param {Array} cachedSongs - Cached songs to apply changes to
 * @param {Object} currentUser - Current user object
 * @returns {Array} Updated songs with offline changes applied
 */
export function applyOfflineChangesToSongs(cachedSongs, currentUser) {
  if (!Array.isArray(cachedSongs) || cachedSongs.length === 0 || !currentUser) {
    return cachedSongs;
  }
  
  // Get pending offline actions
  const pendingActions = getOfflineActions('pending');
  
  if (pendingActions.length === 0) {
    return cachedSongs;
  }
  
  // Clone the songs to avoid mutating the input
  let updatedSongs = [...cachedSongs];
  
  // Process each action and apply changes to songs
  pendingActions.forEach(action => {
    switch (action.type) {
      case 'ADD_SONG':
        // Add new song with temporary ID
        updatedSongs.unshift({
          id: action.id, // Use action ID as temporary song ID
          title: action.data.title,
          artist: action.data.artist,
          notes: action.data.notes,
          youtubeVideoId: action.data.youtubeVideoId,
          youtubeTitle: action.data.youtubeTitle,
          suggestedBy: currentUser.name,
          suggestedById: currentUser.id,
          votes: 0,
          voters: [],
          votedByCurrentUser: false,
          createdAt: new Date().toISOString(),
          isPending: true
        });
        break;
        
      case 'VOTE':
        // Update vote for existing song
        updatedSongs = updatedSongs.map(song => {
          if (song.id === action.data.songId) {
            // Don't double-count if already marked as voted
            if (song.votedByCurrentUser || song.voters.includes(currentUser.id)) {
              return song;
            }
            
            return {
              ...song,
              votes: song.votes + 1,
              voters: [...song.voters, currentUser.id],
              votedByCurrentUser: true,
              hasOfflineVote: true
            };
          }
          return song;
        });
        break;
    }
  });
  
  return updatedSongs;
}

/**
 * Save user login information for offline access
 * @param {Object} user - User object to cache
 * @returns {boolean} Whether the save was successful
 */
export function saveUserForOffline(user) {
  if (typeof window === 'undefined' || !user) return false;
  
  try {
    localStorage.setItem('rmc_offline_user', JSON.stringify({
      user,
      timestamp: Date.now()
    }));
    return true;
  } catch (error) {
    console.error('Failed to save user for offline access:', error);
    return false;
  }
}

/**
 * Get cached user for offline access
 * @param {number} maxAge - Maximum age of cache in milliseconds (default: 30 days)
 * @returns {Object|null} Cached user or null if none found or too old
 */
export function getOfflineUser(maxAge = 30 * 24 * 60 * 60 * 1000) {
  if (typeof window === 'undefined') return null;
  
  try {
    const cachedData = localStorage.getItem('rmc_offline_user');
    if (!cachedData) return null;
    
    const { user, timestamp } = JSON.parse(cachedData);
    
    // Check if cache is too old
    if (Date.now() - timestamp > maxAge) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Failed to get offline user:', error);
    return null;
  }
}

/**
 * Clear all cached data
 * @returns {boolean} Whether the clear was successful
 */
export function clearAllCachedData() {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem('rmc_songs_cache');
    localStorage.removeItem('rmc_offline_actions');
    localStorage.removeItem('rmc_offline_user');
    
    // Also try to clear from cache
    if ('caches' in window) {
      caches.open('rmcsongs-offline-data').then(cache => {
        cache.delete('offline-actions');
      }).catch(err => {
        console.warn('Failed to clear cache:', err);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear all cached data:', error);
    return false;
  }
}
