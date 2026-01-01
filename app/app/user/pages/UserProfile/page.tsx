'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profileAPI, imageAPI } from '../../../utils/api'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  RiCameraLine, 
  RiEditLine, 
  RiSaveLine, 
  RiUserLine, 
  RiMapPinLine, 
  RiFileTextLine,
  RiLink,
  RiFacebookBoxLine,
  RiTwitterLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiLinkedinBoxLine,
  RiGlobeLine,
  RiArrowLeftLine
} from 'react-icons/ri'

function UserProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    location: '',
    country: '',
    biography: 'Music enthusiast and creator. Love exploring new sounds and connecting with fellow musicians.',
    profilePicture: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
      linkedin: '',
      website: ''
    }
  });

  // Fetch user data from backend
  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data from backend for user:', userId);
      console.log('User ID type:', typeof userId);
      console.log('User ID length:', userId?.length);
      console.log('Full URL:', `http://localhost:3001/api/users/${userId}`);
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data from backend:', userData);
        
        if (userData.success && userData.user) {
          const user = userData.user;
          console.log('User profile picture from backend:', user.profilePicture);
          console.log('User profile picture type:', typeof user.profilePicture);
          console.log('User profile picture length:', user.profilePicture?.length);
          
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            displayName: user.displayName || (user.firstName?.toLowerCase() + user.lastName?.toLowerCase()) || '',
            email: user.email || '',
            location: user.location || '',
            country: user.country || '',
            biography: user.biography || 'Music enthusiast and creator. Love exploring new sounds and connecting with fellow musicians.',
            profilePicture: user.profilePicture || '',
            socialLinks: {
              facebook: user.socialLinks?.facebook || '',
              twitter: user.socialLinks?.twitter || '',
              instagram: user.socialLinks?.instagram || '',
              youtube: user.socialLinks?.youtube || '',
              linkedin: user.socialLinks?.linkedin || '',
              website: user.socialLinks?.website || ''
            }
          }));
          
          // Set profile image for display
          if (user.profilePicture && user.profilePicture.trim() !== '') {
            console.log('Setting profile image from backend:', user.profilePicture);
            setProfileImage(user.profilePicture);
          } else {
            console.log('No profile picture found in backend data or empty string');
            setProfileImage(null);
          }
          
          // Initialize country search term with current country
          if (user.country) {
            setCountrySearchTerm(user.country);
          }
          
                  // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Updated localStorage with fresh data');
        
        // Dispatch custom event to notify navbar of profile update
        window.dispatchEvent(new CustomEvent('userProfileUpdated'));
        } else {
          console.error('Invalid response format:', userData);
          loadFromLocalStorage();
        }
      } else {
        console.error('Failed to fetch user data from backend, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 404) {
          console.log('User not found in database, using localStorage data');
        }
        
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching user data from backend:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    }
  };

  // Load user data from localStorage (fallback)
  const loadFromLocalStorage = () => {
    console.log('Loading data from localStorage (fallback)');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        console.log('Profile picture from localStorage:', user.profilePicture);
        
        setFormData(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          displayName: user.displayName || (user.firstName?.toLowerCase() + user.lastName?.toLowerCase()) || '',
          email: user.email || '',
          location: user.location || '',
          country: user.country || '',
          biography: user.biography || 'Music enthusiast and creator. Love exploring new sounds and connecting with fellow musicians.',
          profilePicture: user.profilePicture || '',
          socialLinks: {
            facebook: user.socialLinks?.facebook || '',
            twitter: user.socialLinks?.twitter || '',
            instagram: user.socialLinks?.instagram || '',
            youtube: user.socialLinks?.youtube || '',
            linkedin: user.socialLinks?.linkedin || '',
            website: user.socialLinks?.website || ''
          }
        }));
        
        // Set profile image for display
        if (user.profilePicture) {
          console.log('Setting profile image from localStorage:', user.profilePicture);
          setProfileImage(user.profilePicture);
        } else {
          console.log('No profile picture found in localStorage');
          setProfileImage(null);
        }
        // Initialize country search term with current country
        if (user.country) {
          setCountrySearchTerm(user.country);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.log('No user data found in localStorage');
    }
  };

  // Check URL parameters for edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('edit') === 'true';
    setIsEditing(editMode);
  }, []);

  // Load user data on component mount
  useEffect(() => {
    console.log('Component mounted, loading user data...');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Complete user data from localStorage:', user);
        console.log('User ID from localStorage:', user.id);
        console.log('User ID type:', typeof user.id);
        console.log('User ID length:', user.id?.length);
        
        if (user.id) {
          // Fetch fresh data from backend
          console.log('Fetching fresh data from backend...');
          fetchUserData(user.id);
        } else {
          // Fallback to localStorage if no user ID
          console.log('No user ID found, using localStorage fallback');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        loadFromLocalStorage();
      }
    } else {
      console.log('No user data in localStorage');
    }
  }, []);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
    'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
    'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
    'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];

  // State for searchable country dropdown
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      
      try {
        console.log('Starting image upload for file:', file.name, file.size);
        
        // Upload image to GridFS
        const uploadResponse = await imageAPI.uploadImage(file);
        console.log('Upload response:', uploadResponse);
        
        if (uploadResponse.success) {
          // Set the profile image URL for preview
          const imageUrl = uploadResponse.imageUrl;
          console.log('Setting profile image URL:', imageUrl);
          
          setProfileImage(imageUrl);
          
          // Update form data with the image URL
          setFormData(prev => ({
            ...prev,
            profilePicture: imageUrl
          }));
          
          console.log('Profile image uploaded successfully:', imageUrl);
        } else {
          console.error('Failed to upload image:', uploadResponse.message);
          setSaveMessage({
            type: 'error',
            text: 'Failed to upload image. Please try again.'
          });
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setSaveMessage({
          type: 'error',
          text: 'Error uploading image. Please try again.'
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Filter countries based on search term
  useEffect(() => {
    if (countrySearchTerm) {
      const filtered = countries.filter(country =>
        country.toLowerCase().includes(countrySearchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [countrySearchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({
      ...prev,
      country: country
    }));
    setCountrySearchTerm(country);
    setIsCountryDropdownOpen(false);
  };

  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountrySearchTerm(e.target.value);
    setIsCountryDropdownOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        
        // Save to backend
        const profileData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          location: formData.location,
          country: formData.country,
          biography: formData.biography,
          profilePicture: formData.profilePicture,
          socialLinks: formData.socialLinks
        };
        
        console.log('Saving profile data:', profileData);
        console.log('Profile picture URL:', formData.profilePicture);
        
        const response = await profileAPI.updateProfile(user.id, profileData);
        console.log('Profile update response:', response);
        
        if (response.success) {
          // Update localStorage with new data
          const updatedUser = {
            ...user,
            ...response.user
          };
          console.log('Updated user data:', updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Dispatch custom event to notify navbar of profile update
          window.dispatchEvent(new CustomEvent('userProfileUpdated'));
          
          setSaveMessage({
            type: 'success',
            text: 'Profile updated successfully!'
          });
          
          setIsEditing(false);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSaveMessage(null);
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen ">
        <Navbar />

      <div className="container mx-auto px-4 py-8 pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
              >
                <RiArrowLeftLine size={24} />
                <span className="text-lg">Back</span>
              </button>
              <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-3">
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isEditing ? (
                  <>
                    <RiSaveLine size={20} />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <RiEditLine size={20} />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              saveMessage.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}>
              {saveMessage.text}
            </div>
          )}

          {/* Profile Image Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  {(profileImage || formData.profilePicture) ? (
                    <img 
                      src={profileImage || formData.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <RiUserLine size={48} className="text-white/50" />
                  )}
                </div>
                
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <RiCameraLine size={16} />
                    )}
                  </button>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-gray-400 mb-4">@{formData.displayName}</p>
                {formData.location && (
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400">
                    <RiMapPinLine size={16} />
                    <span>{formData.location}, {formData.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="bg-white/10 z-10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <RiUserLine size={24} />
                <span>Personal Information</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="City"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <div className="relative" ref={countryDropdownRef}>
                      <input
                        type="text"
                        value={countrySearchTerm}
                        onChange={handleCountrySearchChange}
                        onFocus={() => setIsCountryDropdownOpen(true)}
                        disabled={!isEditing}
                        placeholder="Search for a country..."
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      />
                      
                      {isCountryDropdownOpen && isEditing && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map(country => (
                              <button
                                key={country}
                                onClick={() => handleCountrySelect(country)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors text-white border-b border-white/20 last:border-b-0"
                              >
                                {country}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-400 text-sm">
                              No countries found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <RiFileTextLine size={24} />
                <span>Biography</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">About You</label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={8}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white/10  backdrop-blur-sm rounded-2xl p-6 border border-white/20 mt-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <RiLink size={24} />
              <span>Social Media Links</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiFacebookBoxLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Facebook URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiTwitterLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Twitter URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiInstagramLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Instagram URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiYoutubeLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="YouTube URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiLinkedinBoxLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="LinkedIn URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <RiGlobeLine size={24} className="text-primary" />
                </div>
                <input
                  type="url"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Website URL"
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 text-center">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto ${
                  isSaving 
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <RiSaveLine size={20} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        </div>

        <Footer />
    </div>
  )
}

export default UserProfile