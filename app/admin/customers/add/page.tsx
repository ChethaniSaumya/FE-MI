"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";

export default function AddCustomerPage() {
  const [tab, setTab] = useState("profile");
  const [avatar, setAvatar] = useState("https://randomuser.me/api/portraits/men/32.jpg");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    location: "",
    biography: "",
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModal, setEmailModal] = useState({ email: '', password: '' });
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameModal, setUsernameModal] = useState({ username: '', password: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState({ current: '', new: '', confirm: '' });
  const countryData = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
  ];
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneModal, setPhoneModal] = useState({ country: '', phone: '', password: '' });
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [twoFactorType, setTwoFactorType] = useState<'none' | 'sms'>('none');
  const [hasPhone, setHasPhone] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    if (countryDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [countryDropdownOpen]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">Customers <span className="text-lg font-normal text-gray-400 ml-4">Add Customers</span></h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* Left: Account Settings Nav */}
        <div className="w-full lg:w-72 bg-[#101936] rounded-2xl p-4 sm:p-6 flex flex-col gap-2 border border-[#1B2A4B] min-h-[300px] lg:min-h-[500px]">
          <div className="text-white text-lg font-semibold mb-4">Account Settings</div>
          <button
            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === "profile" ? "bg-[#E100FF] text-white" : "text-gray-300 hover:bg-[#232B43]"}`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === "credential" ? "bg-[#E100FF] text-white" : "text-gray-300 hover:bg-[#232B43]"}`}
            onClick={() => setTab("credential")}
          >
            Credential
          </button>
          <button
            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors ${tab === "shipping" ? "bg-[#E100FF] text-white" : "text-gray-300 hover:bg-[#232B43]"}`}
            onClick={() => setTab("shipping")}
          >
            Shipping Address
          </button>
        </div>
        
        {/* Right: Tab Content */}
        <div className="flex-1 bg-[#101936] rounded-2xl p-4 sm:p-8 border-2 border-[#2B3A5B] flex flex-col items-center">
          {tab === "profile" && (
            <>
              <div className="flex flex-col items-center mb-6 sm:mb-8 w-full">
                <div className="relative">
                  <img src={avatar} alt="avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#E100FF] object-cover" />
                  <button
                    className="absolute bottom-2 right-2 bg-[#E100FF] text-white rounded-full p-2 hover:bg-[#c800d6]"
                    onClick={() => avatarInputRef.current?.click()}
                    type="button"
                  >
                    <FaEdit />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg sm:text-xl font-bold text-white">Lahiru Rathnayke</div>
                  <div className="text-sm sm:text-md text-gray-400">ApeXlaiya</div>
                </div>
              </div>
              <form className="w-full max-w-xl mx-auto flex flex-col gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Display Name</label>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Biography</label>
                  <textarea
                    name="biography"
                    value={form.biography}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43] resize-none"
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition"
                  >
                    Save Changes <span className="text-lg">→</span>
                  </button>
                </div>
              </form>
            </>
          )}
          {tab === "credential" && (
            <form className="w-full max-w-xl mx-auto flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-gray-300 mb-1">Email</label>
                <button
                  type="button"
                  className="text-[#E100FF] text-sm font-medium hover:underline cursor-pointer focus:outline-none self-start sm:self-auto"
                  onClick={() => setShowEmailModal(true)}
                >
                  Change e-mail address
                </button>
              </div>
              <input className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-gray-300 mb-1">Username</label>
                <button
                  type="button"
                  className="text-[#E100FF] text-sm font-medium hover:underline cursor-pointer focus:outline-none self-start sm:self-auto"
                  onClick={() => setShowUsernameModal(true)}
                >
                  Change username
                </button>
              </div>
              <input className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-gray-300 mb-1">Password</label>
                <button
                  type="button"
                  className="text-[#E100FF] text-sm font-medium hover:underline cursor-pointer focus:outline-none self-start sm:self-auto"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change password
                </button>
              </div>
              <input type="password" className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-gray-300 mb-1">Phone number</label>
                <button
                  type="button"
                  className="text-[#E100FF] text-sm font-medium hover:underline cursor-pointer focus:outline-none self-start sm:self-auto"
                  onClick={() => setShowPhoneModal(true)}
                >
                  Add phone number
                </button>
              </div>
              <input disabled value="None" className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43] opacity-60" />
              <div>
                <label className="block text-gray-300 mb-1">2-factor authentication</label>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="twofa"
                    value="none"
                    checked={twoFactorType === "none"}
                    onChange={() => setTwoFactorType("none")}
                    className="accent-[#E100FF] w-5 h-5"
                  />
                  <span className="text-white text-base sm:text-lg">None</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="twofa"
                    value="sms"
                    checked={twoFactorType === "sms"}
                    onChange={() => setTwoFactorType("sms")}
                    className="accent-[#E100FF] w-5 h-5"
                  />
                  <span className="text-white text-base sm:text-lg">Text Message (sms)</span>
                </label>
              </div>
              {twoFactorType === "sms" && !hasPhone && (
                <div className="mt-6">
                  <div className="text-lg sm:text-xl text-white font-semibold mb-2">Please add a phone number</div>
                  <div className="text-gray-400 mb-2">To be able to activate SMS security, you first need to associate a phone number to your account</div>
                  <button type="button" className="text-[#E100FF] font-medium hover:underline" onClick={() => setShowPhoneModal(true)}>Add phone number</button>
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition"
                >
                  Save Changes <span className="text-lg">→</span>
                </button>
              </div>
            </form>
          )}
          {tab === "shipping" && (
            <form className="w-full max-w-xl mx-auto flex flex-col gap-4">
              <div>
                <label className="block text-gray-300 mb-1">First Name</label>
                <input
                  name="shippingFirstName"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Last Name</label>
                <input
                  name="shippingLastName"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Phone</label>
                <input
                  name="shippingPhone"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Address</label>
                <input
                  name="shippingAddress"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">City</label>
                <input
                  name="shippingCity"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">State or province</label>
                <input
                  name="shippingState"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Zip Code</label>
                <input
                  name="shippingZip"
                  className="w-full bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg bg-[#E100FF] text-white font-semibold hover:bg-[#c800d6] transition"
                >
                  Save Changes <span className="text-lg">→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192B4D]/10 backdrop-blur-sm p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-[#232B43] relative">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Change E-mail Address</h2>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">New Email</label>
              <input
                type="email"
                value={emailModal.email}
                onChange={e => setEmailModal({ ...emailModal, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter new email address"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Current Password</label>
              <input
                type="password"
                value={emailModal.password}
                onChange={e => setEmailModal({ ...emailModal, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter your current password"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                className="px-4 py-3 rounded-lg bg-[#232B43] text-white hover:bg-[#181F36] transition"
                onClick={() => setShowEmailModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 rounded-lg bg-[#E100FF] text-white hover:bg-[#c800d6] transition disabled:opacity-50"
                // onClick={handleSaveChangeEmail} // Add logic if needed
                type="button"
              >
                Save Change
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192B4D]/10 backdrop-blur-sm p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-[#232B43] relative">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Change Username</h2>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">New Username</label>
              <input
                type="text"
                value={usernameModal.username}
                onChange={e => setUsernameModal({ ...usernameModal, username: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter new username"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Current Password</label>
              <input
                type="password"
                value={usernameModal.password}
                onChange={e => setUsernameModal({ ...usernameModal, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter your current password"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                className="px-4 py-3 rounded-lg bg-[#232B43] text-white hover:bg-[#181F36] transition"
                onClick={() => setShowUsernameModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 rounded-lg bg-[#E100FF] text-white hover:bg-[#c800d6] transition disabled:opacity-50"
                // onClick={handleSaveChangeUsername} // Add logic if needed
                type="button"
              >
                Save Change
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192B4D]/10 backdrop-blur-sm p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-[#232B43] relative">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Change Password</h2>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Current Password</label>
              <input
                type="password"
                value={passwordModal.current}
                onChange={e => setPasswordModal({ ...passwordModal, current: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter your current password"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">New Password</label>
              <input
                type="password"
                value={passwordModal.new}
                onChange={e => setPasswordModal({ ...passwordModal, new: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Confirm New Password</label>
              <input
                type="password"
                value={passwordModal.confirm}
                onChange={e => setPasswordModal({ ...passwordModal, confirm: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                className="px-4 py-3 rounded-lg bg-[#232B43] text-white hover:bg-[#181F36] transition"
                onClick={() => setShowPasswordModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 rounded-lg bg-[#E100FF] text-white hover:bg-[#c800d6] transition disabled:opacity-50"
                // onClick={handleSaveChangePassword} // Add logic if needed
                type="button"
              >
                Save Change
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#192B4D]/10 backdrop-blur-sm p-4">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border-2 border-[#232B43] relative">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Add Phone Number</h2>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Phone Number</label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                <div className="relative w-full sm:w-48" ref={countryDropdownRef}>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between bg-[#181F36] text-white rounded-lg px-4 py-3 border border-[#232B43] focus:border-[#E100FF] focus:outline-none`}
                    onClick={() => setCountryDropdownOpen((open) => !open)}
                  >
                    {phoneModal.country ? (
                      <span className="flex items-center gap-2">
                        {countryData.find(c => c.code === phoneModal.country)?.flag}
                        <span className="text-white">{countryData.find(c => c.code === phoneModal.country)?.name}</span>
                        <span className="text-gray-400">({countryData.find(c => c.code === phoneModal.country)?.code})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">country code</span>
                    )}
                    <span className="ml-2 text-lg">▼</span>
                  </button>
                  {countryDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-2 bg-[#181F36] border border-[#232B43] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {countryData.map((country) => (
                        <button
                          type="button"
                          key={country.code}
                          className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-[#232B43] ${phoneModal.country === country.code ? 'bg-[#232B43]' : ''}`}
                          onClick={() => {
                            setPhoneModal({ ...phoneModal, country: country.code });
                            setCountryDropdownOpen(false);
                          }}
                        >
                          <span>{country.flag}</span>
                          <span className="text-white">{country.name}</span>
                          <span className="ml-auto text-gray-400">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  className="flex-1 bg-[#181F36] text-white rounded-lg px-4 py-3 focus:outline-none border border-[#232B43]"
                  placeholder="Enter phone number..."
                  value={phoneModal.phone}
                  onChange={e => setPhoneModal({ ...phoneModal, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2 font-medium">Password</label>
              <input
                type="password"
                value={phoneModal.password}
                onChange={e => setPhoneModal({ ...phoneModal, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#181F36] text-white border border-[#232B43] focus:outline-none"
                placeholder="Enter your password..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button
                className="px-4 py-3 rounded-lg bg-[#232B43] text-white hover:bg-[#181F36] transition"
                onClick={() => setShowPhoneModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-3 rounded-lg bg-[#E100FF] text-white hover:bg-[#c800d6] transition disabled:opacity-50"
                // onClick={handleSaveChangePhone} // Add logic if needed
                type="button"
              >
                Save Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 