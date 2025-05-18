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
      console.log(`Voting for song ID: ${songId}, User ID: ${user.id}`);
      
      // Add vote to database with retry mechanism
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          await addVote(songId, user.id);
          success = true;
          console.log('Vote successfully added');
        } catch (err) {
          // Check if error is due to unique constraint (already voted)
          if (err.code === '23505') {
            console.log('User has already voted for this song (unique constraint)');
            // This is actually a "success" - the user's vote is recorded
            success = true;
            break;
          } else {
            console.error(`Attempt ${4-retries}/3 failed. Error voting for song:`, err);
            retries--;
            if (retries === 0) throw err; // Rethrow if all retries fail
            await new Promise(r => setTimeout(r, 500)); // Wait before retrying
          }
        }
      }
      
      setIsVoting(false);
      return success;
    } catch (err) {
      // Handle any errors that weren't caught in the retry mechanism
      if (err.code === '23505') {
        console.warn('User has already voted for this song:', err);
        setError('You have already voted for this song');
        setIsVoting(false);
        return true; // Consider this a "success" for UX purposes
      } else {
        console.error('Error voting for song:', err);
        setError('Failed to register vote. Please try again.');
        setIsVoting(false);
        return false;
      }
    }
  };
  
  return {
    isVoting,
    error,
    voteForSong
  };
}