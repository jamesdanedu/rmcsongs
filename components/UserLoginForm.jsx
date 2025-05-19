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
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
            autoCapitalize="words"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Phone size={16} className="mr-1 text-indigo-500" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className={`w-full p-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-indigo-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200`}
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
            autoComplete="tel"
          />
          <p className="mt-1 text-xs text-gray-500">Format: +1234567890 or 1234567890</p>
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
  );
};

export default UserLoginForm;