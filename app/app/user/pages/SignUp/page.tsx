'use client'
import React, { useState } from 'react'
import { authAPI } from '../../../utils/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri"

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    if (name === 'firstName') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
      } else if (value.trim().length < 2) {
        setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 characters' }));
      } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        setErrors(prev => ({ ...prev, firstName: 'First name can only contain letters and spaces' }));
      }
    }
    
    if (name === 'lastName') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
      } else if (value.trim().length < 2) {
        setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 characters' }));
      } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        setErrors(prev => ({ ...prev, lastName: 'Last name can only contain letters and spaces' }));
      }
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, email: 'Email is required' }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else if (value.length > 100) {
        setErrors(prev => ({ ...prev, email: 'Email is too long (max 100 characters)' }));
      }
    }
    
    if (name === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      } else if (value.length < 8) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
      } else if (value.length > 50) {
        setErrors(prev => ({ ...prev, password: 'Password is too long (max 50 characters)' }));
      } else if (!/(?=.*[a-z])/.test(value)) {
        setErrors(prev => ({ ...prev, password: 'Password must contain at least one lowercase letter' }));
      } else if (!/(?=.*[A-Z])/.test(value)) {
        setErrors(prev => ({ ...prev, password: 'Password must contain at least one uppercase letter' }));
      } else if (!/(?=.*\d)/.test(value)) {
        setErrors(prev => ({ ...prev, password: 'Password must contain at least one number' }));
      } else if (!/(?=.*[@$!%*?&])/.test(value)) {
        setErrors(prev => ({ ...prev, password: 'Password must contain at least one special character (@$!%*?&)' }));
      }
    }
    
    if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      } else if (formData.password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email is too long (max 100 characters)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 50) {
      newErrors.password = 'Password is too long (max 50 characters)';
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (@$!%*?&)';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must accept the terms and conditions to continue';
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
        const response = await authAPI.signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          setSubmitMessage({
            type: 'success',
            text: 'Account created successfully! Redirecting to sign in...'
          });
          // Clear form data
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false
          });
          
          // Redirect to sign in page after 2 seconds
          setTimeout(() => {
            window.location.href = '/user/pages/SignIn';
          }, 2000);
        }
      } catch (error: any) {
        console.error('Signup error:', error);
        if (error.response?.data?.message) {
          setSubmitMessage({
            type: 'error',
            text: error.response.data.message
          });
        } else {
          setSubmitMessage({
            type: 'error',
            text: 'An error occurred during signup. Please try again.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">Join our music community today</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                                     <label htmlFor="firstName" className="block text-sm font-medium text-white mb-1">
                     First Name
                   </label>
                                     <input
                     type="text"
                     id="firstName"
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleInputChange}
                     onBlur={handleBlur}
                     className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                       errors.firstName ? 'border-red-500' : 'border-white/20'
                     }`}
                     placeholder="John"
                   />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                                     <label htmlFor="lastName" className="block text-sm font-medium text-white mb-1">
                     Last Name
                   </label>
                                     <input
                     type="text"
                     id="lastName"
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleInputChange}
                     onBlur={handleBlur}
                     className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                       errors.lastName ? 'border-red-500' : 'border-white/20'
                     }`}
                     placeholder="Doe"
                   />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                                 <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                   Email Address
                 </label>
                                 <input
                   type="email"
                   id="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   onBlur={handleBlur}
                   className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                     errors.email ? 'border-red-500' : 'border-white/20'
                   }`}
                   placeholder="john@example.com"
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

              {/* Confirm Password Field */}
              <div>
                                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                   Confirm Password
                 </label>
                <div className="relative">
                                                                      <input
                   type={showConfirmPassword ? 'text' : 'password'}
                   id="confirmPassword"
                   name="confirmPassword"
                   value={formData.confirmPassword}
                   onChange={handleInputChange}
                   onBlur={handleBlur}
                   className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-colors ${
                     errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                   }`}
                   placeholder="••••••••"
                 />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                      Privacy Policy
                    </a>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-400 text-sm mt-1">{errors.agreeToTerms}</p>
                  )}
                </div>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>



            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <a href="/user/pages/SignIn" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default SignUp
