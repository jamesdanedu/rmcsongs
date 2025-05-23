// lib/supabase.js - Enhanced with better error handling

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Supabase configuration is incomplete');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to validate UUID
const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// User-related functions
export async function getUserByName(name) {
  try {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Name is required and must be a non-empty string');
    }
    
    console.log(`Getting user with name: ${name}`);
    
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('name', name.trim())
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

export async function createUser(userData) {
  try {
    console.log('createUser called with:', userData);
    console.log('userData type:', typeof userData);
    
    // Handle both old format (string) and new format (object)
    let name, phoneNumber, isMusician;
    
    if (typeof userData === 'string') {
      name = userData;
      console.log('Using string format, name:', name);
    } else if (typeof userData === 'object') {
      name = userData.name;
      phoneNumber = userData.phoneNumber;
      isMusician = userData.isMusician;
      console.log('Using object format, name:', name, 'phoneNumber:', phoneNumber, 'isMusician:', isMusician);
    } else {
      throw new Error('Invalid user data format');
    }
    
    console.log('Final name value:', name);
    console.log('Name type:', typeof name);
    console.log('Name length:', name ? name.length : 'N/A');
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      console.error('Name validation failed - name:', name);
      throw new Error('Name is required and must be a non-empty string');
    }
    
    console.log(`Creating new user with name: ${name}${phoneNumber ? `, phone: ${phoneNumber}` : ''}`);
    
    const insertData = { name: name.trim() };
    if (phoneNumber) {
      insertData.phone_number = phoneNumber.trim();
    }
    if (isMusician !== undefined) {
      insertData.is_musician = Boolean(isMusician);
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .insert(insertData)
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

export async function updateUser(userId, updateData) {
  try {
    if (!userId || !isValidUUID(userId)) {
      throw new Error('Valid user ID is required');
    }
    
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required and must be an object');
    }
    
    console.log(`Updating user ${userId} with data:`, updateData);
    
    // Validate and clean update data
    const validUpdateData = {};
    
    if (updateData.name) {
      if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
        throw new Error('Name must be a non-empty string');
      }
      validUpdateData.name = updateData.name.trim();
    }
    
    if (updateData.phoneNumber) {
      if (typeof updateData.phoneNumber !== 'string') {
        throw new Error('Phone number must be a string');
      }
      validUpdateData.phone_number = updateData.phoneNumber.trim();
    }
    
    if (updateData.isMusician !== undefined) {
      validUpdateData.is_musician = Boolean(updateData.isMusician);
    }
    
    if (updateData.fullName) {
      if (typeof updateData.fullName !== 'string' || updateData.fullName.trim() === '') {
        throw new Error('Full name must be a non-empty string');
      }
      validUpdateData.name = updateData.fullName.trim();
    }
    
    if (Object.keys(validUpdateData).length === 0) {
      throw new Error('No valid update data provided');
    }
    
    const { data, error } = await supabaseClient
      .from('users')
      .update(validUpdateData)
      .eq('id', userId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('User not found or no changes made');
    }
    
    console.log('User updated successfully:', data);
    return data;
  } catch (err) {
    console.error('updateUser error:', err);
    throw err;
  }
}

// Song-related functions
export async function fetchAllSongs() {
  try {
    console.log('Fetching all songs from Supabase');
    
    // Fetch songs with only the columns that exist in your schema
    const { data, error } = await supabaseClient
      .from('songs')
      .select(`
        *,
        users!songs_suggested_by_fkey (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('No data returned from songs query');
      return [];
    }
    
    console.log(`Retrieved ${data.length} songs from database`);
    
    // Process songs to ensure consistent data structure
    const processedSongs = data.map(song => {
      try {
        return {
          ...song,
          suggesterName: song.users?.name || 'Anonymous'
        };
      } catch (err) {
        console.error('Error processing song:', song, err);
        return {
          ...song,
          suggesterName: 'Anonymous'
        };
      }
    });
    
    console.log('Processed songs:', processedSongs);
    return processedSongs;
    
  } catch (err) {
    console.error('fetchAllSongs error:', err);
    throw err;
  }
}

export async function addSong(songData) {
  try {
    if (!songData || typeof songData !== 'object') {
      throw new Error('Song data is required and must be an object');
    }
    
    if (!songData.title || typeof songData.title !== 'string' || songData.title.trim() === '') {
      throw new Error('Song title is required');
    }
    
    if (!songData.artist || typeof songData.artist !== 'string' || songData.artist.trim() === '') {
      throw new Error('Song artist is required');
    }
    
    if (!songData.suggested_by || !isValidUUID(songData.suggested_by)) {
      throw new Error('Valid suggested_by user ID is required');
    }
    
    console.log('Adding song with data:', songData);
    
    // Validate and clean song data
    const validSongData = {
      title: songData.title.trim(),
      artist: songData.artist.trim(),
      notes: songData.notes ? songData.notes.trim() : null,
      youtube_video_id: songData.youtube_video_id || null,
      youtube_title: songData.youtube_title ? songData.youtube_title.trim() : null,
      suggested_by: songData.suggested_by
    };
    
    // Additional validation for YouTube data
    if (validSongData.youtube_video_id && typeof validSongData.youtube_video_id !== 'string') {
      throw new Error('YouTube video ID must be a string');
    }
    
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
    
    if (!data) {
      throw new Error('No data returned after inserting song');
    }
    
    console.log('Song added successfully:', data);
    return data;
  } catch (err) {
    console.error('addSong error:', err);
    throw err;
  }
}

export async function fetchVotesForSong(songId) {
  try {
    console.log(`Fetching votes for song ID: ${songId}`);
    
    const { data, error } = await supabaseClient
      .from('votes')
      .select('user_id, vote_type, vote_status, voted_at')
      .eq('song_id', songId)
      .eq('vote_status', 'voted');  // Only get actual votes, not pending ones
    
    if (error) {
      console.error('Error fetching votes:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} votes for song ID: ${songId}`);
    return data;
  } catch (err) {
    console.error('fetchVotesForSong error:', err);
    return []; // Return empty array on error
  }
} 

export async function fetchPendingVotesForUser(userId) {
  try {
    console.log(`Fetching pending votes for user ID: ${userId}`);
    
    const { data, error } = await supabaseClient
      .from('votes')
      .select(`
        song_id,
        songs (
          id,
          title,
          artist,
          notes,
          youtube_video_id,
          youtube_title,
          suggested_by,
          created_at,
          users (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .eq('vote_status', 'pending');
    
    if (error) {
      console.error('Error fetching pending votes:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data.length} pending votes for user ID: ${userId}`);
    return data;
  } catch (err) {
    console.error('fetchPendingVotesForUser error:', err);
    return [];
  }
}

export async function addVote(songId, userId, voteType = 'up') {
  try {
    console.log(`Adding ${voteType} vote: Song ID: ${songId}, User ID: ${userId}`);
    
    // Update the existing pending vote record instead of inserting new one
    const { data, error } = await supabaseClient
      .from('votes')
      .update({
        vote_type: voteType,              // 'up' or 'down'
        vote_status: 'voted',             // Change from 'pending' to 'voted'
        voted_at: new Date().toISOString() // Set timestamp when vote occurred
      })
      .eq('song_id', songId)
      .eq('user_id', userId)
      .eq('vote_status', 'pending')       // Only update pending votes
      .select()
      .single();                          // Expect exactly one record to be updated
    
    if (error) {
      console.error('Error updating vote:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No pending vote found to update. This should not happen.');
    }
    
    console.log('Vote updated successfully:', data);
    return data;
  } catch (err) {
    console.error('addVote error:', err);
    throw err;
  }
}

// Health check function
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    
    console.log('Supabase connection is healthy');
    return true;
  } catch (err) {
    console.error('Supabase connection check error:', err);
    return false;
  }
}