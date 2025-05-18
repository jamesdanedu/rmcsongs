// lib/supabase.js - Matching your exact schema

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
      .select('*')
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

export async function createUser(name) {
  try {
    console.log(`Creating new user with name: ${name}`);
    
    const { data, error } = await supabaseClient
      .from('users')
      .insert({ name })
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
          .select('id, name')
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
        const { data: votes, error: voteError } = await supabaseClient
          .from('votes')
          .select('user_id')
          .eq('song_id', song.id);
        
        if (voteError) {
          console.error(`Error fetching votes for song ${song.id}:`, voteError);
          song.votes_count = 0;
          song.voter_ids = [];
        } else {
          song.votes_count = votes.length;
          song.voter_ids = votes.map(vote => vote.user_id);
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
      .select('*')
      .eq('song_id', songId);
    
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

export async function addVote(songId, userId) {
  try {
    console.log(`Adding vote: Song ID: ${songId}, User ID: ${userId}`);
    
    const { data, error } = await supabaseClient
      .from('votes')
      .insert({
        song_id: songId,
        user_id: userId
      })
      .select()
      .maybeSingle();
    
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