// components/UserLoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Check, User, Phone, ArrowRight } from 'lucide-react';

const UserLoginForm = () => {
  const { login, error: authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const success = await login({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber
      });
      
      if (success) {
        // Login successful, redirect or show success message
        console.log('Logged in successfully');
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '0 16px', // Add horizontal padding for mobile
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e7ff',
        width: '100%',
        boxSizing: 'border-box'
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
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="fullName" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <User size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
                Full Name
              </div>
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
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              autoCapitalize="words"
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = errors.fullName ? '#ef4444' : '#c7d2fe'}
            />
            {errors.fullName && (
              <p style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#ef4444'
              }}>
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
                marginBottom: '8px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <Phone size={16} style={{ marginRight: '4px', color: '#6366f1' }} />
                Phone Number
              </div>
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
                outline: 'none',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }}
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.target.style.borderColor = errors.phoneNumber ? '#ef4444' : '#c7d2fe'}
            />
            <p style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Format: +1234567890 or 1234567890
            </p>
            {errors.phoneNumber && (
              <p style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#ef4444'
              }}>
                {errors.phoneNumber}
              </p>
            )}
          </div>
          
          {authError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <X size={16} style={{ marginRight: '8px', marginTop: '2px', flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              background: isLoading 
                ? '#d1d5db' 
                : 'linear-gradient(to right, #4f46e5, #2563eb)',
              color: isLoading ? '#6b7280' : 'white',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.background = 'linear-gradient(to right, #4338ca, #1d4ed8)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.background = 'linear-gradient(to right, #4f46e5, #2563eb)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <ArrowRight size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
          
          <p style={{
            marginTop: '16px',
            fontSize: '12px',
            textAlign: 'center',
            color: '#6b7280',
            lineHeight: '1.4'
          }}>
            Your phone number is stored in encrypted format so it is not readable by humans.
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserLoginForm;
