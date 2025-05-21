
import React from 'react';
import { UserPlus, Music } from 'lucide-react';

/**
 * Custom Choir Icon component
 * Uses UserPlus instead of Users which is not available in lucide-react
 */
const ChoirIcon = ({ size = 28, className = '' }) => {
  // Scale the music note size relative to the main icon size
  const musicSize = Math.max(Math.floor(size * 0.4), 12);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <UserPlus size={size} className="text-indigo-600" />
      <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-md">
        <Music size={musicSize} className="text-indigo-600" />
      </div>
    </div>
  );
};

export default ChoirIcon;