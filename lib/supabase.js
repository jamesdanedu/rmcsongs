// lib/supabase.js - Enhanced with phone number support

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// User-related functions
export async function getUserByName(name) {
  try {
    console.log(`Getting user with name: ${name}`);
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, name, phone_number, created_at, full_name, is_musician')
      .eq('name', name)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    
    console.log('User found:', data);
    return data;
  } catch (err) {
    console.error('getUserByName error:', err);
    throw err;
  }
}

export async function getUserByPhone(phone) {
  try {
    console.log(`Getting user with phone: ${phone}`);
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('id, name, phone_number, created_at, full_name, is_musician')
      .eq('phone_number', phone)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user by phone:', error);
      throw error;
    }
    
    console.log('User found by phone:', data);
    return data;
  } catch (err) {
    console.error('getUserByPhone error:', err);
    throw err;
  }
}

export async function createUser(userData) {
  try {
    console.log(`Creating new user:`, userData);
    
    // Handle both old format (string) and new format (object)
    let userRecord;
    if (typeof userData === 'string') {
      userRecord = { name: userData };
    } else {
      userRecord = {
        name: userData.name,
        ...(userData.phone && { phone_number: userData.phone }),
        ...(typeof userData.is_musician === 'boolean' && { is_musician: userData.is_musician })
      };
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .insert(userRecord)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    console.log('User created:', data);
    return data;
  } catch (err) {
    console.error('createUser error:', err);
    throw err;
  }
}

// Song-related functions - Matching exact schema (no youtube_url)
export async function fetchAllSongs() {
  try {
    console.log('Fetching all songs from Supabase');
    
    // Fetch songs with only the columns that exist in your schema
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
    
    // Get user names separately
    if (data && data.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(data.map(song => song.suggested_by))].filter(Boolean);
      
      if (userIds.length > 0) {
        // Fetch users
        const { data: users, error: userError } = await supabaseClient
          .from('users')
          .select('id, name, phone_number')
          .in('id', userIds);
        
        if (userError) {
          console.error('Error fetching user details:', userError);
        } else if (users) {
          // Create a map of user IDs to names
          const userMap = {};
          users.forEach(user => {
            userMap[user.id] = user.name;
          });
          
          // Add user names to song data
          data.forEach(song => {
            song.suggesterName = userMap[song.suggested_by] || 'Unknown';
          });
        }
      }
      
      // Fetch votes for each song
      for (const song of data) {
        try {
          const votesData = await fetchVotesForSong(song.id);
          
          song.upvotes_count = votesData.upvotes.length;
          song.downvotes_count = votesData.downvotes.length;
          song.votes_count = votesData.upvotes.length; // Keep backward compatibility
          song.voter_ids = votesData.total.map(vote => vote.user_id);
          song.upvoter_ids = votesData.upvotes.map(vote => vote.user_id);
          song.downvoter_ids = votesData.downvotes.map(vote => vote.user_id);
        } catch (voteError) {
          console.error(`Error fetching votes for song ${song.id}:`, voteError);
          // Set defaults if vote fetching fails
          song.upvotes_count = 0;
          song.downvotes_count = 0;
          song.votes_count = 0;
          song.voter_ids = [];
          song.upvoter_ids = [];
          song.downvoter_ids = [];
        }
      }
    }
    
    console.log(`Retrieved ${data ? data.length : 0} songs`);
    return data || [];
  } catch (err) {
    console.error('fetchAllSongs error:', err);
    return []; // Return empty array on error
  }
}

export async function addSong(songData) {
  try {
    console.log('Adding song with data:', songData);
    
    // IMPORTANT: Only include fields that exist in your schema
    const validSongData = {
      title: songData.title,
      artist: songData.artist,
      notes: songData.notes || null,
      youtube_video_id: songData.youtube_video_id || null,
      youtube_title: songData.youtube_title || null,
      suggested_by: songData.suggested_by
    };
    
    console.log('Cleaned song data for insert:', validSongData);
    
    const { data, error } = await supabaseClient
      .from('songs')
      .insert(validSongData)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error adding song:', error);
      throw error;
    }
    
    console.log('Song added successfully:', data);
    return data;
  } catch (err) {
    console.error('addSong error:', err);
    throw err;
  }
}

// Vote-related functions
export async function fetchVotesForSong(songId) {
  try {
    console.log(`Fetching votes for song ID: ${songId}`);
    
    const { data, error } = await supabaseClient
      .from('votes')
      .select('user_id, vote_type')
      .eq('song_id', songId);
    
    if (error) {
      console.error('Error fetching votes:', error);
      
      // If vote_type column doesn't exist, fall back to old structure
      if (error.code === '42703') {
        console.log('vote_type column not found, falling back to legacy structure');
        const { data: legacyData, error: legacyError } = await supabaseClient
          .from('votes')
          .select('user_id')
          .eq('song_id', songId);
          
        if (legacyError) {
          throw legacyError;
        }
        
        // Treat all legacy votes as upvotes
        const upvotes = legacyData || [];
        console.log(`Retrieved ${upvotes.length} votes (legacy format) for song ID: ${songId}`);
        
        return {
          upvotes,
          downvotes: [],
          total: upvotes
        };
      }
      
      throw error;
    }
    
    const upvotes = data.filter(vote => vote.vote_type === 'up' || !vote.vote_type); // Handle legacy votes
    const downvotes = data.filter(vote => vote.vote_type === 'down');
    
    console.log(`Retrieved ${upvotes.length} upvotes and ${downvotes.length} downvotes for song ID: ${songId}`);
    
    return {
      upvotes,
      downvotes,
      total: data
    };
  } catch (err) {
    console.error('fetchVotesForSong error:', err);
    return {
      upvotes: [],
      downvotes: [],
      total: []
    };
  }
}

export async function addVote(songId, userId, voteType = 'up') {
  try {
    console.log(`Adding ${voteType}vote: Song ID: ${songId}, User ID: ${userId}`);
    
    // First try with vote_type column
    let { data, error } = await supabaseClient
      .from('votes')
      .insert({
        song_id: songId,
        user_id: userId,
        vote_type: voteType
      })
      .select()
      .maybeSingle();
    
    // If vote_type column doesn't exist, fall back to legacy structure
    if (error && error.code === '42703') {
      console.log('vote_type column not found, using legacy format');
      ({ data, error } = await supabaseClient
        .from('votes')
        .insert({
          song_id: songId,
          user_id: userId
        })
        .select()
        .maybeSingle());
    }
    
    if (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
    
    console.log('Vote added successfully:', data);
    return data;
  } catch (err) {
    console.error('addVote error:', err);
    throw err;
  }
}

export async function addDownvote(songId, userId) {
  return addVote(songId, userId, 'down');
}

// Difficulty rating functions for musicians
export async function addDifficultyRating(songId, userId, rating) {
  try {
    console.log(`Adding difficulty rating: Song ID: ${songId}, User ID: ${userId}, Rating: ${rating}`);
    
    const { data, error } = await supabaseClient
      .from('difficulty_ratings')
      .upsert({
        song_id: songId,
        user_id: userId,
        rating: rating
      })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error adding difficulty rating:', error);
      throw error;
    }
    
    console.log('Difficulty rating added successfully:', data);
    return data;
  } catch (err) {
    console.error('addDifficultyRating error:', err);
    throw err;
  }
}

export async function fetchDifficultyRatingsForSong(songId) {
  try {
    console.log(`Fetching difficulty ratings for song ID: ${songId}`);
    
    const { data, error } = await supabaseClient
      .from('difficulty_ratings')
      .select('rating, user_id')
      .eq('song_id', songId);
    
    if (error) {
      console.error('Error fetching difficulty ratings:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} difficulty ratings for song ID: ${songId}`);
    return data;
  } catch (err) {
    console.error('fetchDifficultyRatingsForSong error:', err);
    return [];
  }
}