// components/UserLoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, User, ArrowRight, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
      newErrors.fullName = 'Please enter your full name';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const success = await login({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber
      });
      
      if (success) {
        console.log('Logged in successfully');
      }
    }
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      fullName: e.target.value
    });
    
    // Clear name error when user starts typing
    if (errors.fullName) {
      setErrors({
        ...errors,
        fullName: ''
      });
    }
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phoneNumber: value || ''
    });
    
    // Clear phone error when user starts typing
    if (errors.phoneNumber) {
      setErrors({
        ...errors,
        phoneNumber: ''
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <style jsx>{`
        .phone-input .PhoneInputInput {
          border: 2px solid #e5e7eb !important;
          border-radius: 0.75rem !important;
          padding: 12px 16px !important;
          background: rgba(255, 255, 255, 0.7) !important;
          font-size: 16px !important;
          transition: border-color 0.2s ease !important;
          outline: none !important;
        }
        
        .phone-input .PhoneInputInput:focus {
          border-color: #4f46e5 !important;
          box-shadow: none !important;
        }
        
        .phone-input-error .PhoneInputInput {
          border-color: #fca5a5 !important;
        }
        
        .phone-input-error .PhoneInputInput:focus {
          border-color: #ef4444 !important;
        }
        
        .phone-input .PhoneInputCountrySelect {
          border: none !important;
          background: transparent !important;
          margin-right: 8px !important;
        }
        
        .phone-input .PhoneInputCountrySelectArrow {
          border-top-color: var(--PhoneInputCountrySelectArrow-color, #6b7280) !important;
        }
      `}</style>
      
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/30 to-blue-50/50 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <User size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Enter your details to continue to the song wishlist</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 pl-11 border-2 ${
                    errors.fullName || authError 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-indigo-500'
                  } rounded-xl focus:outline-none focus:ring-0 transition-colors duration-200 bg-white/70`}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  autoCapitalize="words"
                  disabled={isLoading}
                />
                <User 
                  size={18} 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.fullName || authError ? 'text-red-400' : 'text-gray-400'
                  }`} 
                />
              </div>
              {errors.fullName && (
                <div className="mt-2 flex items-start space-x-2 text-red-600 text-sm">
                  <X size={14} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.fullName}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="IE"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  disabled={isLoading}
                  className={`phone-input ${
                    errors.phoneNumber || authError 
                      ? 'phone-input-error' 
                      : ''
                  }`}
                  style={{
                    '--PhoneInputCountrySelectArrow-color': errors.phoneNumber || authError ? '#ef4444' : '#6b7280',
                    '--PhoneInput-color--focus': errors.phoneNumber || authError ? '#ef4444' : '#4f46e5'
                  }}
                />
              </div>
              {errors.phoneNumber && (
                <div className="mt-2 flex items-start space-x-2 text-red-600 text-sm">
                  <X size={14} className="flex-shrink-0 mt-0.5" />
                  <p>{errors.phoneNumber}</p>
                </div>
              )}
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <X size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !formData.fullName.trim() || !formData.phoneNumber}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isLoading || !formData.fullName.trim() || !formData.phoneNumber
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Your phone number is stored in encrypted format and used only for authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginForm;