import React from 'react';
import { RefreshCw } from 'lucide-react';

const UpdatePrompt = ({ onUpdate }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      left: '16px',
      right: '16px',
      background: '#4f46e5',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '448px',
      margin: '0 auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000
    }}>
      <span>New version available!</span>
      <button 
        onClick={onUpdate}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'white',
          color: '#4f46e5',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          fontWeight: '500',
          cursor: 'pointer'
        }}
      >
        <RefreshCw size={14} />
        <span>Update</span>
      </button>
    </div>
  );
};

export default UpdatePrompt;
