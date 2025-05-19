'use client';

import React from 'react';
import { PlusCircle, Heart, BarChart3 } from 'lucide-react';

/**
 * Navigation tabs for the main app sections
 */
const TabNavigation = ({ activeTab, setActiveTab }) => {
  // Function to handle special logic for the Vote tab
  const handleVoteTabClick = () => {
    setActiveTab('vote');
  };

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
      <button
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          background: activeTab === 'suggest' ? '#4F46E5' : 'white',
          color: activeTab === 'suggest' ? 'white' : '#4B5563',
          boxShadow: activeTab === 'suggest' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onClick={() => setActiveTab('suggest')}
      >
        <PlusCircle size={18} style={{ marginRight: '6px' }} />
        <span>Suggest</span>
      </button>
      <button
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          background: activeTab === 'vote' ? '#4F46E5' : 'white',
          color: activeTab === 'vote' ? 'white' : '#4B5563',
          boxShadow: activeTab === 'vote' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onClick={handleVoteTabClick}
      >
        <Heart size={18} style={{ marginRight: '6px' }} />
        <span>Vote</span>
      </button>
      <button
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500',
          background: activeTab === 'rank' ? '#4F46E5' : 'white',
          color: activeTab === 'rank' ? 'white' : '#4B5563',
          boxShadow: activeTab === 'rank' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onClick={() => setActiveTab('rank')}
      >
        <BarChart3 size={18} style={{ marginRight: '6px' }} />
        <span>Rankings</span>
      </button>
    </div>
  );
};

export default TabNavigation;