'use client'
import React, { useState } from 'react'
import { authAPI } from '../../../utils/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri"

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate individual field on blur
    if (name === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, email: 'Email or username is required' }));
      } else if (value.length > 100) {
        setErrors(prev => ({ ...prev, email: 'Email or username is too long (max 100 characters)' }));
      }
    }
    
    if (name === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      } else if (value.length < 1) {
        setErrors(prev => ({ ...prev, password: 'Password cannot be empty' }));
      } else if (value.length > 100) {
        setErrors(prev => ({ ...prev, password: 'Password is too long (max 100 characters)' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email/Username validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email or username is required';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email or username is too long (max 100 characters)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 1) {
      newErrors.password = 'Password cannot be empty';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password is too long (max 100 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    setIsLoading(true);
    setSubmitMessage(null);
    
    try {
      // Call your authentication API
      const response = await authAPI.signin({
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        setSubmitMessage({
          type: 'success',
          text: 'Login successful! Redirecting...'
        });
        
        // Store user data with all role flags
        const userData = {
          ...response.user,
          // These should come from your backend response
          isAdmin: response.user.isAdmin || false,
          role: response.user.role || 'user',
          isCreator: response.user.isCreator || false,
          isBuyer: response.user.isBuyer || true
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set cookie for middleware
        document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400; SameSite=Strict`;
        
        // Redirect based on role
        setTimeout(() => {
          if (userData.isAdmin && userData.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/user/pages/CreatorDashboard';
          }
        }, 1500);
      } else {
        setSubmitMessage({
          type: 'error',
          text: response.message || 'Invalid credentials'
        });
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setSubmitMessage({
          type: 'error',
          text: 'Invalid email/username or password'
        });
      } else if (error.response?.data?.message) {
        setSubmitMessage({
          type: 'error',
          text: error.response.data.message
        });
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Network error. Please check your connection.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  }
};

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      setSubmitMessage({
        type: 'error',
        text: 'Please enter your email address.'
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setSubmitMessage({
        type: 'error',
        text: 'Please enter a valid email address.'
      });
      return;
    }
    
    try {
      setIsResettingPassword(true);
      setSubmitMessage(null);
      
      // Call the forgot password API
      const response = await authAPI.forgotPassword({
        email: forgotPasswordEmail
      });
      
      if (response.success) {
        // Store the reset link if provided
        if (response.resetLink) {
          setResetLink(response.resetLink);
        }
        
        setSubmitMessage({
          type: 'success',
          text: response.message || 'Password reset link generated successfully.'
        });
        
        // Don't close the modal if we have a reset link to show
        if (!response.resetLink) {
          setShowForgotPassword(false);
          setForgotPasswordEmail('');
        }
      } else {
        setSubmitMessage({
          type: 'error',
          text: response.message || 'Failed to send password reset email. Please try again.'
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setSubmitMessage({
        type: 'error',
        text: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
        
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account</p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="john@example.com or username"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-colors ${
                      errors.password ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  submitMessage.type === 'success' 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors ${
                  isLoading 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>



            {/* Sign Up Link */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <a href="/user/pages/SignUp" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181F36] rounded-xl p-6 w-full max-w-md border border-[#232B43]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                  setSubmitMessage(null);
                  setResetLink(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#232B43] border border-[#3A4A5C] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setSubmitMessage(null);
                    setResetLink(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
                >
                  {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
            
            {/* Reset Link Display */}
            {resetLink && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Password Reset Link Generated</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Since email is not configured, here's your password reset link:
                </p>
                <div className="bg-[#232B43] p-3 rounded border">
                  <p className="text-blue-400 text-sm break-all mb-2">{resetLink}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resetLink);
                      setSubmitMessage({
                        type: 'success',
                        text: 'Reset link copied to clipboard!'
                      });
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    setSubmitMessage(null);
                    setResetLink(null);
                  }}
                  className="mt-3 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default SignIn 