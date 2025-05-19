'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, Music, Mic, PlusCircle, ThumbsUp, ThumbsDown, Youtube, User, Loader } from 'lucide-react';
import { isValidYouTubeVideoId } from '../lib/youtube-api';

/**
 * Tinder-style card component for swiping votes
 */
const TinderCard = ({ song, onSwipe, onCardClick }) => {
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [direction, setDirection] = useState(null);

  // Touch/mouse event handlers
  const handleStart = (clientX) => {
    startXRef.current = clientX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  };

  const handleMouseStart = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleMove = (clientX) => {
    const deltaX = clientX - startXRef.current;
    currentXRef.current = deltaX;
    
    // Calculate rotation (more rotate with more swipe)
    const rotate = deltaX / 10; 
    
    // Threshold for direction indication
    if (deltaX > 50) {
      setDirection('right');
    } else if (deltaX < -50) {
      setDirection('left');
    } else {
      setDirection(null);
    }
    
    setTranslateX(deltaX);
    setRotation(rotate);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);

    // Determine if the swipe should count (threshold)
    const threshold = 100;
    
    if (currentXRef.current > threshold) {
      // Swipe right - upvote
      finishSwipeAnimation(true);
    } else if (currentXRef.current < -threshold) {
      // Swipe left - downvote
      finishSwipeAnimation(false);
    } else {
      // Reset position if not meeting threshold
      resetPosition();
    }
  };

  const finishSwipeAnimation = (isLike) => {
    // Animate the card off-screen
    const screenWidth = window.innerWidth;
    const endX = isLike ? screenWidth : -screenWidth;
    
    setTranslateX(endX);
    setOpacity(0);
    
    // Call the callback after animation
    setTimeout(() => {
      onSwipe(isLike);
    }, 300);
  };

  const resetPosition = () => {
    setTranslateX(0);
    setRotation(0);
    setDirection(null);
  };

  // Function to manually trigger swipe animation
  const triggerSwipe = (isLike) => {
    finishSwipeAnimation(isLike);
  };

  const handleCardClick = (e) => {
    // Only trigger click if not swiping
    if (Math.abs(currentXRef.current) < 10) {
      onCardClick(song);
    }
  };

  // Use thumbnail from YouTube if available
  const youtubeThumbnail = song.youtubeVideoId 
    ? `https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`
    : null;

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: opacity,
        willChange: 'transform, opacity',
        cursor: 'grab',
        zIndex: 100,
      }}
      onMouseDown={handleMouseStart}
      onTouchStart={handleTouchStart}
      onClick={handleCardClick}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Swipe direction indicators */}
        {direction === 'right' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transform: 'rotate(12deg)',
          }}>
            <ThumbsUp size={22} style={{ marginRight: '6px' }} />
            LIKE
          </div>
        )}
        
        {direction === 'left' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transform: 'rotate(-12deg)',
          }}>
            <ThumbsDown size={22} style={{ marginRight: '6px' }} />
            NOPE
          </div>
        )}
        
        {/* Placeholder thumbnail or album cover */}
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: '#E0E7FF',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {youtubeThumbnail ? (
            <>
              <img 
                src={youtubeThumbnail} 
                alt={song.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
              }}>
                <Youtube size={14} style={{ marginRight: '4px' }} />
                Watch Video
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#4F46E5',
            }}>
              <Music size={48} />
              <p style={{ marginTop: '8px', fontSize: '14px' }}>No thumbnail available</p>
            </div>
          )}
        </div>
        
        {/* Song info */}
        <div style={{ padding: '16px', flex: 1 }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1F2937' }}>
            {song.title}
          </h3>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#4B5563', 
            margin: '0 0 10px 0',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Mic size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
            {song.artist}
          </p>
          
          {song.notes && (
            <div style={{
              margin: '12px 0',
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4B5563',
            }}>
              <p style={{ margin: '0' }}>{song.notes}</p>
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            <p style={{ 
              fontSize: '13px', 
              color: '#6B7280', 
              margin: '16px 0 0 0',
              display: 'flex',
              alignItems: 'center',
            }}>
              <User size={14} style={{ marginRight: '6px' }} />
              Suggested by: {song.suggestedBy}
            </p>
          </div>
        </div>
        
        {/* Bottom action bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          padding: '12px 16px 16px',
          borderTop: '1px solid #F3F4F6',
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(false);
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ThumbsDown size={24} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerSwipe(true);
            }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: '#D1FAE5',
              color: '#10B981',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ThumbsUp size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Tab for voting on songs
 */
const VoteTab = ({ votes, songs }) => {
  // Destructure the hooks values
  const { voteForSong, isVoting, error: voteError } = votes || {};
  const { getSongsToVote } = songs || { getSongsToVote: () => [] };
  
  // Local state
  const [songIndex, setSongIndex] = useState(0);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [voteType, setVoteType] = useState('up'); // 'up' or 'down'

  // Effect to check if we need to show empty state for voting
  useEffect(() => {
    const nonVotedSongs = getSongsToVote ? getSongsToVote() : [];
    setShowEmptyState(nonVotedSongs.length === 0);
    
    // Reset song index if it's out of bounds
    if (nonVotedSongs.length > 0 && songIndex >= nonVotedSongs.length) {
      setSongIndex(0);
    }
  }, [getSongsToVote, songIndex]);

  // Handle voting for a song
  const handleVote = async (isUpvote) => {
    const nonVotedSongs = getSongsToVote ? getSongsToVote() : [];
    
    if (nonVotedSongs.length > 0 && songIndex < nonVotedSongs.length) {
      const currentSong = nonVotedSongs[songIndex];
      
      // Set vote type for UI feedback
      setVoteType(isUpvote ? 'up' : 'down');
      
      try {
        // Register vote in database (only if upvoted - downvote just skips)
        let success = true;
        
        if (isUpvote && voteForSong) {
          // Log the attempt
          console.log(`Attempting to vote for song: ${currentSong.title} (${currentSong.id})`);
          
          try {
            // Try to register the vote
            success = await voteForSong(currentSong.id);
            
            if (success) {
              console.log(`Vote for "${currentSong.title}" successfully recorded!`);
              
              // Find the next available song
              let nextSongIndex = 0;
              const remainingSongs = nonVotedSongs.filter(s => s.id !== currentSong.id);
              
              if (remainingSongs.length > 0) {
                // Still have songs to vote on
                const nextSongIds = remainingSongs.map(s => s.id);
                nextSongIndex = nonVotedSongs.findIndex(s => nextSongIds.includes(s.id));
                if (nextSongIndex === -1) nextSongIndex = 0;
                setSongIndex(nextSongIndex);
              } else {
                // No more songs to vote on
                setShowEmptyState(true);
                setSongIndex(0);
              }
            } else {
              console.log(`Failed to record vote for "${currentSong.title}". Please try again.`);
            }
          } catch (error) {
            console.error('Error registering vote:', error);
            success = false;
          }
        } else {
          console.log('Skipping song (downvote)');
          
          // For a downvote, just move to the next song without voting
          const nextIndex = (songIndex + 1) % nonVotedSongs.length;
          setSongIndex(nextIndex);
        }
      } catch (err) {
        console.error("Error in handleVote:", err);
      }
    }
  };

  // Handle YouTube video click from the card
  const handleCardClick = (song) => {
    if (song.youtubeVideoId && isValidYouTubeVideoId(song.youtubeVideoId)) {
      window.open(`https://www.youtube.com/watch?v=${song.youtubeVideoId}`, '_blank');
    }
  };

  return (
    <div style={{height: '600px', position: 'relative', marginTop: '16px'}}>
      <h2 style={{fontSize: '18px', fontWeight: '600', margin: '0 0 16px 4px', display: 'flex', alignItems: 'center', color: '#1F2937'}}>
        <Heart size={20} style={{marginRight: '8px', color: '#EC4899'}} />
        Swipe to Vote on Songs
      </h2>
      
      {voteError && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#FEF2F2',
          borderRadius: '8px',
          borderLeft: '4px solid #EF4444',
          color: '#B91C1C'
        }}>
          {voteError}
        </div>
      )}
      
      {showEmptyState ? (
        <div style={{
          background: 'white', 
          padding: '32px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100% - 50px)', // Account for the header
        }}>
          <Music size={56} style={{color: '#D1D5DB', marginBottom: '16px'}} />
          <p style={{color: '#4B5563', fontWeight: '600', fontSize: '18px', margin: '0 0 8px 0'}}>
            No more songs to vote on!
          </p>
          <p style={{color: '#9CA3AF', fontSize: '14px', margin: '0 0 16px 0', maxWidth: '280px'}}>
            You've voted on all the suggested songs. Check back later or suggest some new ones.
          </p>
          <button
            onClick={() => window.location.href = '#suggest'} // This is a simple way to trigger tab change
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
              background: '#4F46E5',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <PlusCircle size={18} style={{marginRight: '8px'}} />
            <span>Suggest a Song</span>
          </button>
        </div>
      ) : (
        <div style={{
          height: 'calc(100% - 50px)', // Account for the header
          position: 'relative',
        }}>
          {/* Instructions */}
          <div style={{
            textAlign: 'center',
            padding: '12px',
            marginBottom: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6B7280',
          }}>
            <p style={{margin: '0'}}>
              Swipe right to like, swipe left to dislike, or tap the song to listen on YouTube
            </p>
          </div>
          
          {/* Card Stack */}
          <div style={{
            height: '500px',
            position: 'relative',
            margin: '0 auto',
          }}>
            {isVoting && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 101,
                borderRadius: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    border: '3px solid #EBF0FF', 
                    borderTopColor: '#4F46E5',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '8px',
                  }}></div>
                  <p style={{
                    color: '#4F46E5', 
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Recording your vote
                  </p>
                </div>
              </div>
            )}
            
            {getSongsToVote && getSongsToVote().length > 0 && songIndex < getSongsToVote().length && (
              <TinderCard
                key={getSongsToVote()[songIndex].id}
                song={getSongsToVote()[songIndex]}
                onSwipe={handleVote}
                onCardClick={handleCardClick}
              />
            )}
          </div>
        </div>
      )}

      {/* Add CSS for animation */}
      <style dangerouslySetInnerHTML={{
        __html: "@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }"
      }} />
    </div>
  );
};

export default VoteTab;