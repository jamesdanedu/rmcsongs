'use client';

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSongs } from '../hooks/useSongs';
import { useVotes } from '../hooks/useVotes';
import UserLoginForm from './UserLoginForm';
import SessionManager from './SessionManager';
import TabNavigation from './TabNavigation';
import SuggestTab from './SuggestTab';
import VoteTab from './VoteTab';
import RankingsTab from './RankingsTab';

const ChoirSongApp = () => {
  const { user, isLoggedIn, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('suggest');
  
  // Only initialize these hooks if the user is logged in
  const songsHook = isLoggedIn ? useSongs(user) : null;
  const votesHook = isLoggedIn ? useVotes(user) : null;

  if (authLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return <UserLoginForm />;
  }
  
  return (
    <SessionManager>
      <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>
          <header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>RMC Song Wishlist</h1>
              <button onClick={logout}>Logout</button>
            </div>
            <p>Logged in as: {user?.full_name}</p>
            
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </header>
          
          {activeTab === 'suggest' && (
            <SuggestTab songs={songsHook} user={user} />
          )}
          
          {activeTab === 'vote' && (
            <VoteTab votes={votesHook} songs={songsHook} />
          )}
          
          {activeTab === 'rank' && (
            <RankingsTab songs={songsHook} />
          )}
        </div>
      </div>
    </SessionManager>
  );
};

export default ChoirSongApp;