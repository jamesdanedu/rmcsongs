import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// User-related functions
export async function getUserByName(name) {
  const { data, error } = await supabaseClient
    .from('users')
    .select('id, name')
    .eq('name', name)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
    console.error('Error fetching user:', error);
  }
  
  return data;
}

export async function createUser(name) {
  const { data, error } = await supabaseClient
    .from('users')
    .insert([{ name }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
}

// Song-related functions
export async function fetchAllSongs() {
  const { data, error } = await supabaseClient
    .from('songs')
    .select(`
      id, 
      title, 
      artist, 
      notes, 
      youtube_video_id, 
      youtube_title, 
      suggested_by,
      created_at,
      users(name)
    `)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
  
  return data;
}

export async function addSong(songData) {
  const { data, error } = await supabaseClient
    .from('songs')
    .insert([songData])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding song:', error);
    throw error;
  }
  
  return data;
}

// Vote-related functions
export async function fetchVotesForSong(songId) {
  const { data, error } = await supabaseClient
    .from('votes')
    .select('user_id')
    .eq('song_id', songId);
    
  if (error) {
    console.error('Error fetching votes:', error);
    throw error;
  }
  
  return data;
}

export async function addVote(songId, userId) {
  const { data, error } = await supabaseClient
    .from('votes')
    .insert([{
      song_id: songId,
      user_id: userId
    }]);
    
  if (error) {
    console.error('Error adding vote:', error);
    throw error;
  }
  
  return data;
}
