import { useState } from 'react';
import { addVote } from '../lib/supabase';

/**
 * Custom hook for handling song votes
 */
export function useVotes(user) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState(null);
  const [votingStates, setVotingStates] = useState({}); // Track voting state per song
  
  // Function to vote for a song
  const voteForSong = async (songId) => {
    if (!user) {
      setError('You must be logged in to vote');
      return false;
    }
    
    if (!songId) {
      setError('Invalid song ID');
      return false;
    }
    
    // Check if already voting for this song
    if (votingStates[songId]) {
      console.log(`Already voting for song ${songId}, skipping`);
      return false;
    }
    
    setIsVoting(true);
    setVotingStates(prev => ({ ...prev, [songId]: true }));
    setError(null);
    
    try {
      console.log(`Attempting to vote for song ID: ${songId}, User ID: ${user.id}`);
      
      // Validate inputs
      if (typeof songId !== 'string' || songId.trim() === '') {
        throw new Error('Invalid song ID provided');
      }
      
      if (!user.id || typeof user.id !== 'string') {
        throw new Error('Invalid user ID');
      }
      
      // Add vote to database with retry mechanism
      let retries = 3;
      let success = false;
      let lastError = null;
      
      while (retries > 0 && !success) {
        try {
          console.log(`Vote attempt ${4-retries}/3 for song ${songId}`);
          
          const voteResult = await addVote(songId, user.id);
          console.log('Vote result:', voteResult);
          
          success = true;
          console.log('Vote successfully added');
          
        } catch (err) {
          lastError = err;
          console.error(`Attempt ${4-retries}/3 failed. Error voting for song:`, err);
          
          // Check if error is due to unique constraint (already voted)
          if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('unique')) {
            console.log('User has already voted for this song (unique constraint)');
            // This is actually a "success" - the user's vote is recorded
            success = true;
            break;
          }
          
          // Check for other specific errors that shouldn't be retried
          if (err.message?.includes('Invalid') || err.code === '22P02') {
            console.error('Non-retryable error:', err);
            break;
          }
          
          retries--;
          if (retries > 0) {
            console.log(`Retrying in 500ms... (${retries} attempts remaining)`);
            await new Promise(r => setTimeout(r, 500)); // Wait before retrying
          }
        }
      }
      
      if (!success && lastError) {
        throw lastError;
      }
      
      console.log(`Vote operation completed successfully for song ${songId}`);
      return true;
      
    } catch (err) {
      console.error('Final error voting for song:', err);
      
      // Handle specific error types
      if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('unique')) {
        console.warn('User has already voted for this song:', err);
        setError('You have already voted for this song');
        return true; // Consider this a "success" for UX purposes
      } else if (err.message?.includes('Invalid') || err.message?.includes('not found')) {
        setError('Unable to find this song. Please refresh and try again.');
        return false;
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
        return false;
      } else {
        setError(`Failed to register vote: ${err.message || 'Unknown error'}`);
        return false;
      }
    } finally {
      setIsVoting(false);
      setVotingStates(prev => {
        const newState = { ...prev };
        delete newState[songId];
        return newState;
      });
    }
  };
  
  // Function to check if currently voting for a specific song
  const isVotingForSong = (songId) => {
    return Boolean(votingStates[songId]);
  };
  
  // Function to clear any error
  const clearError = () => {
    setError(null);
  };
  
  return {
    isVoting,
    error,
    voteForSong,
    isVotingForSong,
    clearError
  };
}