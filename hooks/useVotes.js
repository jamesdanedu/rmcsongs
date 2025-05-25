// hooks/useVotes.js - Combined approach with retry logic and robust error handling

import { useState } from 'react';
import { addVote } from '../lib/supabase';

/**
 * Custom hook for handling song votes (upvotes and downvotes)
 * - Includes retry logic for race conditions
 * - Provides specific error handling
 * - Offers convenience methods for different vote types
 */
export function useVotes(user) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to vote for a song with specific vote type
  const voteForSong = async (songId, voteType = 'up') => {
    if (!user) {
      setError('You must be logged in to vote');
      return false;
    }

    // Validate songId
    if (!songId) {
      setError('Invalid song ID');
      return false;
    }

    // Validate voteType
    if (voteType !== 'up' && voteType !== 'down') {
      setError('Invalid vote type. Must be "up" or "down"');
      return false;
    }
    
    setIsVoting(true);
    setError(null);
    
    // Add retry logic for race conditions
    let retries = 3;
    
    while (retries > 0) {
      try {
        console.log(`Attempt ${4-retries}/3: Voting "${voteType}" for song ID: ${songId}, User ID: ${user.id}`);
        
        // Call the addVote function with vote type
        await addVote(songId, user.id, voteType);
        
        console.log(`${voteType === 'up' ? 'Upvote' : 'Downvote'} successfully recorded`);
        setIsVoting(false);
        return true;
      } catch (err) {
        retries--;
        console.error(`Attempt ${4-retries}/3 failed. Error voting for song:`, err);
        
        // For certain error types, don't retry
        if (
          err.message?.includes('No pending vote found') || 
          err.code === '23505' || // Unique constraint violation
          err.message?.includes('not available for voting')
        ) {
          // These are "final" errors that won't be fixed by retrying
          if (err.message?.includes('No pending vote found')) {
            setError('You have already voted on this song or it is not available for voting');
          } else if (err.code === '23505') {
            setError('You have already voted on this song');
          } else {
            setError(`Failed to register ${voteType === 'up' ? 'upvote' : 'downvote'}: ${err.message}`);
          }
          setIsVoting(false);
          return false;
        }
        
        // If this was the last retry, handle the error
        if (retries === 0) {
          setError(`Failed to register ${voteType === 'up' ? 'upvote' : 'downvote'}. Please try again.`);
          setIsVoting(false);
          return false;
        }
        
        // Wait before retrying - increase wait time with each retry
        const waitTime = 300 * (4 - retries); // 300ms, 600ms, 900ms
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
    
    // This should never be reached because the loop will either return true on success
    // or return false on the last retry, but included for completeness
    setIsVoting(false);
    return false;
  };

  // Convenience function for upvoting
  const upvoteForSong = async (songId) => {
    return await voteForSong(songId, 'up');
  };

  // Convenience function for downvoting
  const downvoteForSong = async (songId) => {
    return await voteForSong(songId, 'down');
  };

  // Clear any existing errors
  const clearError = () => {
    setError(null);
  };
  
  // Return all functions and state
  return {
    isVoting,
    error,
    voteForSong,      // Generic function: voteForSong(songId, 'up'/'down')
    upvoteForSong,    // Convenience: upvoteForSong(songId)
    downvoteForSong,  // Convenience: downvoteForSong(songId)
    clearError        // Utility to reset error state
  };
}