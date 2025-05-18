// lib/supabase.js - Modified version

// Import the Supabase client library conditionally
let createClient;
try {
  // This tries to import the supabase package, but won't crash if it's not available
  ({ createClient } = require('@supabase/supabase-js'));
} catch (error) {
  console.warn('Supabase client not available, using mock implementation');
  // Provide mock implementation
  createClient = () => mockSupabaseClient();
}

// Initialize the Supabase client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock client that won't crash when Supabase is not configured
function mockSupabaseClient() {
  const mockResponse = (data = null, error = null) => ({ data, error });
  
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => mockResponse(null, { code: 'MOCK_NOT_FOUND' })
        }),
        order: () => mockResponse([]),
      }),
      insert: () => ({
        select: () => ({
          single: async () => mockResponse({ id: 'mock-id', name: 'Mock User' })
        })
      })
    }),
    storage: {
      from: () => ({
        upload: async () => mockResponse({ path: 'mock-path' }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com/image.jpg' } })
      })
    }
  };
}

// Create the actual client or fallback to mock
export const supabaseClient = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabaseClient();

// Local storage based implementations for development
const getLocalStorage = (key, defaultValue = []) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error setting localStorage:', e);
  }
};

// User-related functions with localStorage fallback
export async function getUserByName(name) {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { data, error } = await supabaseClient
        .from('users')
        .select('id, name')
        .eq('name', name)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
        console.error('Error fetching user:', error);
      }
      
      return data;
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  const users = getLocalStorage('rmc_users', []);
  return users.find(user => user.name === name) || null;
}

export async function createUser(name) {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
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
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  const users = getLocalStorage('rmc_users', []);
  const newUser = { id: Date.now().toString(), name };
  users.push(newUser);
  setLocalStorage('rmc_users', users);
  return newUser;
}

// Song-related functions with localStorage fallback
export async function fetchAllSongs() {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
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
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  return getLocalStorage('rmc_songs', []);
}

export async function addSong(songData) {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
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
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  const songs = getLocalStorage('rmc_songs', []);
  const newSong = {
    id: Date.now().toString(),
    ...songData,
    created_at: new Date().toISOString()
  };
  songs.push(newSong);
  setLocalStorage('rmc_songs', songs);
  return newSong;
}

// Vote-related functions with localStorage fallback
export async function fetchVotesForSong(songId) {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { data, error } = await supabaseClient
        .from('votes')
        .select('user_id')
        .eq('song_id', songId);
        
      if (error) {
        console.error('Error fetching votes:', error);
        throw error;
      }
      
      return data;
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  const votes = getLocalStorage('rmc_votes', []);
  return votes.filter(vote => vote.song_id === songId);
}

export async function addVote(songId, userId) {
  // Try Supabase first if configured
  if (supabaseUrl && supabaseAnonKey) {
    try {
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
    } catch (e) {
      console.warn('Supabase error, falling back to localStorage', e);
    }
  }
  
  // Fallback to localStorage
  const votes = getLocalStorage('rmc_votes', []);
  const newVote = {
    id: Date.now().toString(),
    song_id: songId,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  
  // Check if user already voted
  const existingVote = votes.find(v => v.song_id === songId && v.user_id === userId);
  if (existingVote) {
    return existingVote;
  }
  
  votes.push(newVote);
  setLocalStorage('rmc_votes', votes);
  return newVote;
}