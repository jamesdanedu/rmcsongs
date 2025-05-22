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
    }
    // react-phone-number-input handles validation internally
    // If phoneNumber has a value, it's already validated
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phoneNumber: value || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('UserLoginForm handleSubmit called');
    console.log('Form data:', formData);
    console.log('Form validation result:', validateForm());
    
    if (validateForm()) {
      const loginData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        isMusician: formData.isMusician
      };
      
      console.log('Calling login with:', loginData);
      console.log('Login data type:', typeof loginData);
      console.log('Login data keys:', Object.keys(loginData));
      
      const success = await login(loginData);
      
      if (success) {
        console.log('Logged in successfully');
      } else {
        console.log('Login failed');
      }
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  return (
    <>
      <style jsx>{`
        .phone-input {
          width: 100%;
        }
        
        .phone-input .PhoneInputInput {
          border: 1px solid #c7d2fe;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          transition: all 0.2s ease;
          outline: none;
          width: 100%;
          background: white;
        }
        
        .phone-input .PhoneInputInput:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        
        .phone-input-error .PhoneInputInput {
          border-color: #ef4444;
        }
        
        .phone-input .PhoneInputCountrySelect {
          border: 1px solid #c7d2fe;
          border-radius: 0.5rem;
          margin-right: 0.5rem;
          padding: 0.75rem 0.5rem;
          background: white;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .phone-input .PhoneInputCountrySelect:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        
        .phone-input-error .PhoneInputCountrySelect {
          border-color: #ef4444;
        }
        
        .phone-input .PhoneInputCountrySelectArrow {
          color: #6366f1;
        }
      `}</style>
      
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm border border-indigo-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1 mt-3">Sign In</h1>
        <p className="text-indigo-400 text-sm">Enter your details to continue</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <User size={16} className="mr-1 text-indigo-500" />
            Full Name (not phone number)
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`w-full p-3 border ${errors.fullName ? 'border-red-500' : 'border-indigo-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200`}
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name (e.g., John Smith)"
            autoComplete="name"
            autoCapitalize="words"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMusician"
              name="isMusician"
              checked={formData.isMusician}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isMusician" className="ml-2 block text-sm text-gray-900 flex items-center">
              <Music size={16} className="mr-1 text-indigo-500" />
              I am a musician
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Musicians can rate song difficulty and access additional features
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Phone size={16} className="mr-1 text-indigo-500" />
            Phone Number
          </label>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry="IE"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            className={`phone-input ${errors.phoneNumber ? 'phone-input-error' : ''}`}
            placeholder="Enter your phone number"
            style={{
              '--PhoneInputCountryFlag-aspectRatio': '1.5',
              '--PhoneInputCountrySelectArrow-color': '#6366f1',
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Select your country and enter your phone number
          </p>
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
        
        <p className="mt-4 text-xs text-center text-gray-500">
          Your phone number is stored in encrypted format so it not
          readable by humans.
        </p>
      </form>
    </div>
    </>
  );
};

export default UserLoginForm;