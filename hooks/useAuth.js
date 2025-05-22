import { useState, useEffect } from 'react';
import { getUserByName, getUserByPhone, createUser, supabaseClient } from '../lib/supabase';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [, forceRender] = useState(0); // Force re-render state
  
  // Check for existing session in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('rmc_choir_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('rmc_choir_user');
      }
    }
  }, []);
  
  // Enhanced login function to handle both phone+name and name-only
  const login = async (phoneNumberOrName, nameIfPhoneProvided = null, isMusician = false) => {
    // Determine if this is the new format (phone + name) or old format (just name)
    const isPhoneNumberLogin = phoneNumberOrName && 
      typeof phoneNumberOrName === 'string' && 
      (phoneNumberOrName.startsWith('+') || phoneNumberOrName.length > 10);
    
    let identifier, userName;
    
    if (isPhoneNumberLogin && nameIfPhoneProvided) {
      // New format: phone number + name + musician flag
      identifier = typeof phoneNumberOrName === 'string' ? phoneNumberOrName.trim() : '';
      userName = typeof nameIfPhoneProvided === 'string' ? nameIfPhoneProvided.trim() : '';
      
      if (!identifier) {
        setError('Please enter your phone number');
        return false;
      }
      
      if (!userName) {
        setError('Please enter your name');
        return false;
      }
    } else {
      // Old format: just name (backward compatibility)
      identifier = phoneNumberOrName && typeof phoneNumberOrName === 'string' ? phoneNumberOrName.trim() : '';
      userName = identifier;
      
      if (!identifier) {
        setError('Please enter your name');
        return false;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let userData;
      
      if (isPhoneNumberLogin && nameIfPhoneProvided) {
        // Try to find user by name first (for existing users who now provide phone)
        userData = await getUserByName(userName);
        
        if (!userData) {
          // Try to find by phone number
          userData = await getUserByPhone(identifier);
        }
        
        if (!userData) {
          // Create new user with both name and phone
          try {
            userData = await createUser({
              name: userName,
              phone: identifier,
              is_musician: isMusician
            });
          } catch (err) {
            // Check for unique constraint violation
            if (err.code === '23505') {
              // Try to determine which field caused the constraint violation
              if (err.message && err.message.includes('phone')) {
                setError('This phone number is already registered.');
              } else {
                setError('This name is already taken. Please choose another name.');
              }
              setIsLoading(false);
              return false;
            }
            throw err;
          }
        } else if (userData && !userData.phone_number) {
          // Update existing user with phone number if they don't have one
          try {
            const { data, error } = await supabaseClient
              .from('users')
              .update({ phone_number: identifier })
              .eq('id', userData.id)
              .select()
              .single();
            
            if (!error) {
              userData = data;
            }
          } catch (updateError) {
            console.warn('Could not update user with phone number:', updateError);
            // Continue with login even if phone update fails
          }
        }
      } else {
        // Legacy login: find by name only
        userData = await getUserByName(identifier);
        
        if (!userData) {
          // Create new user with name only (backward compatibility)
          try {
            userData = await createUser(identifier);
          } catch (err) {
            // Check for unique constraint violation (name already exists)
            if (err.code === '23505') {
              setError('This name is already taken. Please choose another name.');
              setIsLoading(false);
              return false;
            }
            throw err;
          }
        }
      }
      
      // Store user in state and localStorage
      console.log('Setting user state:', userData);
      
      // Use React's functional state update to ensure fresh state
      setUser(() => userData);
      localStorage.setItem('rmc_choir_user', JSON.stringify(userData));
      console.log('User state set, isLoggedIn should be:', !!userData);
      
      // Finish loading after state is set
      setIsLoading(false);
      
      // Temporary fix: force page reload to pick up the new state
      setTimeout(() => {
        console.log('Forcing page reload to pick up login state');
        window.location.reload();
      }, 100);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setIsLoading(false);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('rmc_choir_user');
  };
  
  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isLoggedIn: Boolean(user && user.id) // More explicit boolean check
  };
}