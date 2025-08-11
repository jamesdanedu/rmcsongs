// components/UserLoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Check, User, Phone, ArrowRight, Info, Loader, CloudOff } from 'lucide-react';
import { saveUserForOffline, getOfflineUser } from '../utils/offlineStorage';

const UserLoginForm = () => {
  const { login, error: authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [showOfflineLoginAttempt, setShowOfflineLoginAttempt] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState(null);
  
  // Check online status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check if we're already offline on mount
    if (!navigator.onLine) {
      setShowOfflineWarning(true);
    }
    
    // Check if there was a recent login attempt while offline
    const storedAttempt = localStorage.getItem('rmc_last_login_attempt');
    if (storedAttempt) {
      try {
        const attempt = JSON.parse(storedAttempt);
        
        // Check if attempt is less than 24 hours old
        const isRecent = (Date.now() - attempt.timestamp) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          setLastLoginAttempt(attempt);
          
          // Pre-fill the form with the last attempt
          setFormData(prevData => ({
            ...prevData,
            fullName: attempt.fullName || prevData.fullName
          }));
          
          // If offline, show the offline login prompt
          if (!navigator.onLine) {
            setShowOfflineLoginAttempt(true);
          }
        }
      } catch (error) {
        console.error('Failed to parse stored login attempt:', error);
        localStorage.removeItem('rmc_last_login_attempt');
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name is too short';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Name is too long';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      setShowOfflineWarning(true);
      return;
    }
    
    if (validateForm()) {
      try {
        const success = await login(formData.fullName);
        
        if (success) {
          // Login successful, redirect happens automatically
          console.log('Logged in successfully');
          
          // Cache user data for offline login
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('rmc_last_login_attempt', JSON.stringify({
                fullName: formData.fullName,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.error('Failed to cache login data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const handleOfflineLogin = () => {
    if (!lastLoginAttempt) return;
    
    // Get the user from offline storage
    const offlineUser = getOfflineUser();
    
    if (offlineUser) {
      // Save offline user in the auth context
      login(offlineUser, true);
    } else {
      setShowOfflineWarning(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border border-indigo-100" style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '24rem',
      border: '1px solid #e0e7ff'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#4338ca',
          marginBottom: '4px',
          marginTop: '12px'
        }}>
          Sign In
        </h1>
        <p style={{
          color: '#818cf8',
          fontSize: '14px'
        }}>
          Enter your details to continue
        </p>
      </div>
      
      {showOfflineWarning && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '12px',
          marginBottom: '16px',
          background: '#fee2e2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <CloudOff size={16} style={{ color: '#ef4444', marginRight: '8px', marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: '#ef4444', margin: 0 }}>
            You are currently offline. Login requires an internet connection.
            {showOfflineLoginAttempt && (
              <span style={{ display: 'block', marginTop: '8px' }}>
                However, you can continue with your previous login.
              </span>
            )}
          </p>
        </div>
      )}
      
      {showOfflineLoginAttempt && !isOnline ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px',
          marginBottom: '16px',
          background: '#eef2ff',
          borderRadius: '8px',
          border: '1px solid #c7d2fe'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#4338ca', 
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Continue as <strong>{lastLoginAttempt.fullName}</strong>?
          </p>
          
          <button
            onClick={handleOfflineLogin}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'linear-gradient(to right, #4f46e5, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <User size={16} />
            Continue Offline
          </button>
          
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '12px',
            textAlign: 'center'
          }}>
            Limited functionality available in offline mode
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="fullName" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <User size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.fullName ? '1px solid #ef4444' : '1px solid #c7d2fe',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              autoCapitalize="words"
              disabled={isLoading || !isOnline}
            />
            {errors.fullName && (
              <p style={{ 
                marginTop: '4px', 
                fontSize: '14px', 
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center'
              }}>
                <X size={14} style={{ marginRight: '4px' }} />
                {errors.fullName}
              </p>
            )}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="phoneNumber" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Phone size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.phoneNumber ? '1px solid #ef4444' : '1px solid #c7d2fe',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              disabled={isLoading || !isOnline}
            />
            <p style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              Format: +1234567890 or 1234567890
            </p>
            {errors.phoneNumber && (
              <p style={{ 
                marginTop: '4px', 
                fontSize: '14px', 
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center'
              }}>
                <X size={14} style={{ marginRight: '4px' }} />
                {errors.phoneNumber}
              </p>
            )}
          </div>
          
          {authError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#ef4444',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <X size={16} style={{ marginRight: '8px', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '14px', margin: 0 }}>{authError}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !isOnline}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '500',
              ...(isLoading || !isOnline 
                ? {
                    background: '#d1d5db',
                    color: '#6b7280',
                    cursor: 'not-allowed',
                    border: 'none'
                  } 
                : {
                    background: 'linear-gradient(to right, #4f46e5, #2563eb)',
                    color: 'white',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }
              )
            }}
            onMouseOver={(e) => {
              if (!isLoading && isOnline) {
                e.target.style.background = 'linear-gradient(to right, #4338ca, #1d4ed8)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && isOnline) {
                e.target.style.background = 'linear-gradient(to right, #4f46e5, #2563eb)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader size={18} style={{ 
                  marginRight: '8px', 
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} style={{ marginRight: '8px' }} />
                <span>Sign In</span>
              </>
            )}
          </button>
          
          <p style={{ 
            marginTop: '16px', 
            fontSize: '12px', 
            textAlign: 'center', 
            color: '#6b7280' 
          }}>
            Your information is stored securely and only used for choir-related communications.
          </p>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#eef2ff', 
            borderRadius: '8px',
            border: '1px solid #c7d2fe'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#4338ca', 
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Check size={12} style={{ marginRight: '4px' }} />
              <strong>Choir Member Benefits:</strong>
            </p>
            <ul style={{ 
              margin: '8px 0 0 0', 
              padding: '0 0 0 20px', 
              fontSize: '12px', 
              color: '#6366f1' 
            }}>
              <li>Suggest songs for the choir to perform</li>
              <li>Vote on song suggestions from other members</li>
              <li>View real-time rankings of popular songs</li>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserLoginForm;
