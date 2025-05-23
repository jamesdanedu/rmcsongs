// Updated hooks/useVotes.js 

import { useState } from 'react';
import { addVote } from '../lib/supabase';

/**
 * Custom hook for handling song votes (upvotes and downvotes)
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

    // Validate voteType
    if (voteType !== 'up' && voteType !== 'down') {
      setError('Invalid vote type. Must be "up" or "down"');
      return false;
    }
    
    setIsVoting(true);
    setError(null);
    
    try {
      console.log(`Voting "${voteType}" for song ID: ${songId}, User ID: ${user.id}`);
      
      // Call updated addVote function with vote type
      await addVote(songId, user.id, voteType);
      
      console.log(`${voteType === 'up' ? 'Upvote' : 'Downvote'} successfully recorded`);
      setIsVoting(false);
      return true;
    } catch (err) {
      console.error('Error voting for song:', err);
      
      // Handle specific error cases
      if (err.message?.includes('No pending vote found')) {
        setError('You have already voted on this song or it is not available for voting');
      } else if (err.code === '23505') {
        // Unique constraint violation - shouldn't happen with new system but handle gracefully
        setError('You have already voted on this song');
      } else {
        setError(`Failed to register ${voteType === 'up' ? 'upvote' : 'downvote'}. Please try again.`);
      }
      
      setIsVoting(false);
      return false;
    }
  };

  // Convenience functions for specific vote types
  const upvoteForSong = async (songId) => {
    return await voteForSong(songId, 'up');
  };

  const downvoteForSong = async (songId) => {
    return await voteForSong(songId, 'down');
  };

  // Clear any existing errors
  const clearError = () => {
    setError(null);
  };
  
  return {
    isVoting,
    error,
    voteForSong,      // Generic function: voteForSong(songId, 'up'/'down')
    upvoteForSong,    // Convenience: upvoteForSong(songId)
    downvoteForSong,  // Convenience: downvoteForSong(songId)
    clearError
  };
}