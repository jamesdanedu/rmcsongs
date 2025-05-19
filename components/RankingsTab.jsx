'use client';

import React from 'react';
import { BarChart3, ListMusic, Star, ExternalLink, User } from 'lucide-react';

const RankingsTab = ({ songs }) => {
  // Destructure the songs hook values
  const { getSortedSongs, isLoading: songsLoading } = songs || { 
    getSortedSongs: () => [], 
    isLoading: false 
  };

  // Get the sorted songs
  const sortedSongs = getSortedSongs ? getSortedSongs() : [];

  // If still loading, show loading state
  if (songsLoading) {
    return (
      <div style={{
        marginTop: '16px',
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(79, 70, 229, 0.2)',
          borderTopColor: '#4F46E5',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#4F46E5', fontWeight: '500' }}>Loading rankings...</p>
        
        <style dangerouslySetInnerHTML={{
          __html: "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"
        }} />
      </div>
    );
  }

  // If no songs, show empty state
  if (sortedSongs.length === 0) {
    return (
      <div style={{
        marginTop: '16px',
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <ListMusic size={48} style={{ margin: '0 auto 12px auto', color: '#D1D5DB' }} />
        <p style={{ color: '#4B5563', fontWeight: '500', margin: '0' }}>No songs have been suggested yet.</p>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '4px' }}>Go to the Suggest tab to add a song!</p>
      </div>
    );
  }

  // Calculate the maximum votes for scaling the bars
  const maxVotes = Math.max(...sortedSongs.map(s => s.votes), 1);

  return (
    <div style={{ marginTop: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', color: '#1F2937' }}>
        <BarChart3 size={20} style={{ marginRight: '8px', color: '#4F46E5' }} />
        Song Rankings
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Bar chart visualization */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 16px 0', color: '#4B5563', paddingBottom: '8px', borderBottom: '1px solid #F3F4F6' }}>Top Songs</h3>
          {sortedSongs.map((song, index) => {
            const percentage = Math.max((song.votes / maxVotes) * 100, 15);
            
            return (
              <div key={song.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    fontWeight: 'bold',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div
                      style={{
                        height: '40px',
                        background: 'linear-gradient(to right, #818CF8, #6366F1)',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s',
                        width: `${percentage}%`
                      }}
                    >
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <span style={{ color: 'white', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</span>
                        <div style={{
                          marginLeft: 'auto',
                          background: 'white',
                          color: '#4338CA',
                          borderRadius: '50%',
                          height: '24px',
                          width: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                          {song.votes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Detailed list */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', margin: '0', padding: '16px', borderBottom: '1px solid #F3F4F6', color: '#4B5563' }}>
            Detailed List
          </h3>
          <div style={{ maxHeight: '384px', overflowY: 'auto' }}>
            {sortedSongs.map((song, index) => (
              <div
                key={song.id}
                style={{
                  padding: '16px',
                  borderBottom: index < sortedSongs.length - 1 ? '1px solid #F3F4F6' : 'none',
                  transition: 'background-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{
                    fontWeight: 'bold',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    marginRight: '12px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1F2937',
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      {song.title}
                      {song.youtubeVideoId && (
                        
                          href={"https://www.youtube.com/watch?v=" + song.youtubeVideoId}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#4F46E5',
                            marginLeft: '8px',
                            display: 'inline-flex',
                          }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#4B5563',
                      margin: '4px 0 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {song.artist}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 0 0', display: 'flex', alignItems: 'center' }}>
                      <User size={12} style={{ marginRight: '4px' }} />
                      Suggested by: {song.suggestedBy}
                    </p>
                  </div>
                  <div style={{
                    marginLeft: '12px',
                    background: '#F3F4FF',
                    color: '#4338CA',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <Star size={14} style={{ marginRight: '4px', color: '#FBBF24' }} />
                    {song.votes}
                  </div>
                </div>

                {/* Show notes if available */}
                {song.notes && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '8px 12px', 
                    background: '#F9FAFB',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#6B7280'
                  }}>
                    {song.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"
      }} />
    </div>
  );
};

export default RankingsTab;