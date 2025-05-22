// components/UserLoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Check, User, Phone, ArrowRight, Music } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const UserLoginForm = () => {
  const { login, error: authError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    isMusician: false
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Pass phone number as first parameter, name as second, and musician flag as third
      const success = await login(formData.phoneNumber, formData.fullName, formData.isMusician);
      
      if (success) {
        console.log('Logged in successfully');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border border-indigo-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1 mt-3">Sign In</h1>
        <p className="text-indigo-400 text-sm">Enter your details to continue</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <User size={16} className="mr-1 text-indigo-500" />
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`w-full p-3 border ${errors.fullName ? 'border-red-500' : 'border-indigo-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200`}
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            autoCapitalize="words"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isMusician}
              onChange={(e) => handleChange('isMusician', e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
              formData.isMusician 
                ? 'bg-indigo-600 border-indigo-600' 
                : 'border-indigo-200'
            }`}>
              {formData.isMusician && (
                <Check size={12} className="absolute top-0.5 left-0.5 text-white" />
              )}
            </div>
            <span className="ml-2 text-sm text-gray-700 flex items-center">
              <Music size={16} className="mr-1 text-indigo-500" />
              I am a musician in the group
            </span>
          </label>
          <p className="mt-1 text-xs text-gray-500">Musicians can provide difficulty ratings for songs</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Phone size={16} className="mr-1 text-indigo-500" />
            Phone Number
          </label>
          <div className={`w-full ${errors.phoneNumber ? 'phone-input-error' : ''}`}>
            <PhoneInput
              value={formData.phoneNumber}
              onChange={(value) => handleChange('phoneNumber', value)}
              defaultCountry="IE"
              placeholder="Enter phone number"
              className="w-full"
              style={{
                '--PhoneInputCountryFlag-height': '1.2em',
                '--PhoneInputCountrySelectArrow-opacity': 0.6
              }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">International format recommended</p>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>
        
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
            <X size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{authError}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
            isLoading 
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 shadow-sm'
          }`}
        >
          {isLoading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <ArrowRight size={18} className="mr-1" />
              <span>Sign In</span>
            </>
          )}
        </button>
        
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-xs text-center text-indigo-600">
            <strong>Existing users:</strong> You can use any phone number for now.
            Your data is linked by name.
          </p>
        </div>
      </form>
    </div>
  );
};

export default UserLoginForm;