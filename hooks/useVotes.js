import { useState } from 'react';
import { addVote } from '../lib/supabase';

/**
 * Custom hook for handling song votes
 */
export function useVotes(user) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to vote for a song
  const voteForSong = async (songId) => {
    if (!user) {
      setError('You must be logged in to vote');
      return false;
    }
    
    setIsVoting(true);
    setError(null);
    
    try {
      await addVote(songId, user.id);
      setIsVoting(false);
      return true;
    } catch (err) {
      // Check if error is due to unique constraint (already voted)
      if (err.code === '23505') {
        setError('You have already voted for this song');
      } else {
        console.error('Error voting for song:', err);
        setError('Failed to register vote. Please try again.');
      }
      setIsVoting(false);
      return false;
    }
  };
  
  return {
    isVoting,
    error,
    voteForSong
  };
}