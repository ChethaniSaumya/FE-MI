"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { FaCloudUploadAlt, FaFileAudio } from "react-icons/fa";
import { trackAPI, genreAPI, imageAPI, musicianAPI } from '../../../utils/api';
import { useRouter, useSearchParams } from "next/navigation";

const typeOptions = ["Song", "Beats", "Beats w/hook", "Top lines", "Vocal"];
const moodOptions = [
  "Bouncy", "Dark", "Energetic", "Soulful", "Inspiring", "Confident", "Sad", "Mellow", "Relaxed", "Calm", "Angry", "Happy", "Epic", "Accomplished", "Quirky", "Determined", "Crazy", "Loved", "Intense", "Powerful", "Dirty", "Lonely", "Depressed", "Hyper", "Flirty", "Grateful", "Rebellious", "Peaceful", "Evil", "Adored", "Gloomy", "Romantic", "Anxious", "Crunk", "Eccentric", "Neutral", "Exciting", "Dramatic", "Enraged", "Tense", "Majestic", "Annoyed", "Disappointed", "Lazy", "Silly", "Giddy", "Frantic", "Scared", "Scary", "Chill", "Bold", "Melancholy", "Seductive", "Dreamy", "Carefree", "Restless", "Mysterious", "Dancy", "Euphoric", "Rage", "Warm", "Optimistic", "Uplifting", "Sentimental", "Hopeful", "Cheerful", "Soothing", "Heartfelt", "Playful"
];
const energyOptions = ["High", "Medium", "Low"];
const trackKeyOptions = [
  "None", "Cm", "Dm", "Em", "Fm", "Gm", "Bm", "F♯m", "Am", "C♯m", "D♯m", "G♯m", "A♯m", "E♭m", "CM", "B♭m", "DM", "A♭m", "GM", "EM", "AM", "FM", "BM", "F♯M", "D♭m", "E♭M", "A♭M", "C♯M", "D♭M", "B♭M", "A♯M", "G♭M", "C♭M", "D♯M", "G♯M"
];

function AddTrackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Add new genre state
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreDescription, setNewGenreDescription] = useState('');
  const [isAddingGenre, setIsAddingGenre] = useState(false);

  // Search state
  const [genreSearch, setGenreSearch] = useState('');
  const [trackImage, setTrackImage] = useState<string | null>(null);
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [genresData, setGenresData] = useState<{ id: string; name: string; description: string; color: string; isActive: boolean; }[]>([]);
  const [musiciansData, setMusiciansData] = useState<Array<{
    name: string;
    userId: string;
    stripeEnabled: boolean;
    email: string | null;
  }>>([]);
  const [musiciansLoading, setMusiciansLoading] = useState(false);
  const [musicianProfiles, setMusicianProfiles] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    trackName: '',
    trackId: '',
    bpm: '',
    trackKey: '',
    trackPrice: '',
    musician: '',
    trackType: '',
    moodType: '',
    energyType: '',
    about: '',
    seoTitle: '',
    metaKeyword: '',
    metaDescription: '',
    publish: 'Public'
  });

  // Loading and message states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load track data if in edit mode
    if (isEditMode) {
      const editTrackData = localStorage.getItem('editTrackData');
      if (editTrackData) {
        try {
          const trackData = JSON.parse(editTrackData);

          // Populate form data
          setFormData({
            trackName: trackData.trackName || '',
            trackId: trackData.trackId || '',
            bpm: trackData.bpm?.toString() || '',
            trackKey: trackData.trackKey || '',
            trackPrice: trackData.trackPrice?.toString() || '',
            musician: trackData.musician || '',
            trackType: trackData.trackType || '',
            moodType: trackData.moodType || '',
            energyType: trackData.energyType || '',
            about: trackData.about || '',
            seoTitle: trackData.seoTitle || '',
            metaKeyword: trackData.metaKeyword || '',
            metaDescription: trackData.metaDescription || '',
            publish: trackData.publish || 'Public'
          });

          // Set track image if available
          if (trackData.trackImage) {
            setTrackImage(trackData.trackImage);
          }

          // Set selected genres
          if (trackData.genreCategory && Array.isArray(trackData.genreCategory)) {
            setSelectedGenres(trackData.genreCategory);
          }

          // Set musician profile picture if available
          if (trackData.musician && trackData.musicianProfilePicture) {
            setMusicianProfiles(prev => ({
              ...prev,
              [trackData.musician]: trackData.musicianProfilePicture
            }));
          }

          // Store the track ID for updating
          setEditingTrackId(trackData.id || trackData._id);

          // Clear the localStorage after loading
          localStorage.removeItem('editTrackData');
        } catch (error) {
          console.error('Error parsing track data:', error);
        }
      }
    }

    // Fetch genres from MongoDB
    const fetchGenres = async () => {
      try {
        const response = await genreAPI.getGenres();
        if (response.success) {
          setGenresData(response.genres);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    // Fetch musicians from MongoDB
    // Fetch musicians with user IDs and Stripe status
    const fetchMusicians = async () => {
      try {
        setMusiciansLoading(true);
        const response = await fetch('http://localhost:3001/api/musicians/all');
        const data = await response.json();

        if (data.success) {
          setMusiciansData(data.musicians);
        }
      } catch (error) {
        console.error('Error fetching musicians:', error);
      } finally {
        setMusiciansLoading(false);
      }
    };

    fetchGenres();
    fetchMusicians();
  }, [isEditMode]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSubmitMessage('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSubmitMessage('Image file size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    setSubmitMessage('');

    try {
      setTrackImage(URL.createObjectURL(file));
      setImageFile(file);

      const response = await imageAPI.uploadImage(file);

      if (response.success) {
        setImageFileId(response.fileId);
        setSubmitMessage('Image uploaded successfully!');

        setTimeout(() => {
          setSubmitMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSubmitMessage(error.response?.data?.message || 'Failed to upload image');

      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsUploadingImage(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setTrackFile(file);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const filteredGenres = genresData.filter(genre =>
    genre.name.toLowerCase().includes(genreSearch.toLowerCase()) ||
    genre.description.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const handleAddGenre = async () => {
    if (!newGenreName.trim() || isAddingGenre) return;

    setIsAddingGenre(true);
    try {
      const response = await genreAPI.createGenre({
        name: newGenreName.trim(),
        description: newGenreDescription.trim()
      });

      if (response.success) {
        const newGenre = response.genre;
        const genreId = newGenre.id;

        setGenresData(prev => {
          const exists = prev.find(g => g.id === genreId);
          if (exists) return prev;
          return [...prev, {
            id: genreId,
            name: newGenre.name,
            description: newGenre.description,
            color: newGenre.color,
            isActive: newGenre.isActive
          }];
        });

        setSelectedGenres(prev => {
          if (prev.includes(genreId)) return prev;
          return [...prev, genreId];
        });

        setNewGenreName('');
        setNewGenreDescription('');
        setShowAddGenre(false);
      }
    } catch (error) {
      console.error('Error adding genre:', error);
    } finally {
      setIsAddingGenre(false);
    }
  };

  // Complete updated handleSubmit function with creator_id mapping
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate required fields
      if (!formData.trackName || !formData.trackId) {
        setSubmitMessage('Please fill in all required fields (Track Name and Track ID)');
        setIsSubmitting(false);
        return;
      }

      if (!formData.musician || formData.musician.trim() === '') {
        setSubmitMessage('Please select or enter a musician name');
        setIsSubmitting(false);
        return;
      }

      // NEW: Find the musician's user ID based on selected name
      const selectedMusician = musiciansData.find(m => m.name === formData.musician);

      // NEW: Validate that paid tracks have a creator with Stripe enabled
      if (parseFloat(formData.trackPrice) > 0) {
        if (!selectedMusician) {
          setSubmitMessage('Please select a musician from the dropdown for paid tracks');
          setIsSubmitting(false);
          return;
        }

        if (!selectedMusician.stripeEnabled) {
          const confirmed = window.confirm(
            'Warning: The selected musician has not set up payment processing yet.\n\n' +
            'Buyers will NOT be able to purchase this track until the musician completes Stripe setup.\n\n' +
            'Do you want to continue creating this track anyway?'
          );
          if (!confirmed) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const imageUrl = imageFileId ? imageAPI.getImage(imageFileId) : trackImage || '';

      let musicianProfilePicture = '';
      if (formData.musician && musicianProfiles[formData.musician]) {
        musicianProfilePicture = musicianProfiles[formData.musician];
      }

      const hasFiles = trackFile || imageFile;
      let response;

      // ====== EDIT MODE WITH FILES ======
      if (isEditMode && editingTrackId && hasFiles) {
        const formDataToSend = new FormData();

        formDataToSend.append('trackName', formData.trackName);
        formDataToSend.append('trackId', formData.trackId);
        if (formData.bpm) formDataToSend.append('bpm', formData.bpm);
        if (formData.trackKey) formDataToSend.append('trackKey', formData.trackKey);
        if (formData.trackPrice) formDataToSend.append('trackPrice', formData.trackPrice);
        if (formData.musician) formDataToSend.append('musician', formData.musician);
        formDataToSend.append('trackType', formData.trackType);
        if (formData.moodType) formDataToSend.append('moodType', formData.moodType);
        if (formData.energyType) formDataToSend.append('energyType', formData.energyType);
        if (formData.about) formDataToSend.append('about', formData.about);
        if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
        if (formData.metaKeyword) formDataToSend.append('metaKeyword', formData.metaKeyword);
        if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
        if (musicianProfilePicture) formDataToSend.append('musicianProfilePicture', musicianProfilePicture);

        formDataToSend.append('publish', 'Public');

        // NEW: Add creator_id if we found the musician
        if (selectedMusician?.userId) {
          formDataToSend.append('creatorId', selectedMusician.userId);
        }

        selectedGenres.forEach((genre, index) => {
          formDataToSend.append(`genre_category[${index}]`, genre);
        });

        if (trackFile) {
          formDataToSend.append('audio', trackFile);
        }
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        response = await trackAPI.updateTrackWithFiles(editingTrackId, formDataToSend);
      }
      // ====== EDIT MODE WITHOUT FILES ======
      else if (isEditMode && editingTrackId) {
        const trackData = {
          ...formData,
          bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
          trackPrice: formData.trackPrice ? parseFloat(formData.trackPrice) : 0,
          trackImage: imageUrl,
          trackFile: trackFile?.name || '',
          genreCategory: selectedGenres,
          musicianProfilePicture: musicianProfilePicture,
          publish: 'Public',
          creatorId: selectedMusician?.userId || null  // NEW: Add creator_id
        };
        response = await trackAPI.updateTrack(editingTrackId, trackData);
      }
      // ====== CREATE MODE WITH FILES ======
      else if (hasFiles) {
        const formDataToSend = new FormData();

        formDataToSend.append('trackName', formData.trackName);
        formDataToSend.append('trackId', formData.trackId);
        if (formData.bpm) formDataToSend.append('bpm', formData.bpm);
        if (formData.trackKey) formDataToSend.append('trackKey', formData.trackKey);
        if (formData.trackPrice) formDataToSend.append('trackPrice', formData.trackPrice);
        if (formData.musician) formDataToSend.append('musician', formData.musician);
        formDataToSend.append('trackType', formData.trackType);
        if (formData.moodType) formDataToSend.append('moodType', formData.moodType);
        if (formData.energyType) formDataToSend.append('energyType', formData.energyType);
        if (formData.about) formDataToSend.append('about', formData.about);
        if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
        if (formData.metaKeyword) formDataToSend.append('metaKeyword', formData.metaKeyword);
        if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
        if (musicianProfilePicture) formDataToSend.append('musicianProfilePicture', musicianProfilePicture);

        formDataToSend.append('publish', 'Public');

        // NEW: Add creator_id if we found the musician
        if (selectedMusician?.userId) {
          formDataToSend.append('creatorId', selectedMusician.userId);
        }

        selectedGenres.forEach((genre, index) => {
          formDataToSend.append(`genreCategory[${index}]`, genre);
        });

        if (trackFile) {
          formDataToSend.append('audio', trackFile);
        }
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }

        response = await trackAPI.createTrackWithFiles(formDataToSend);
      }
      // ====== CREATE MODE WITHOUT FILES ======
      else {
        const trackData = {
          ...formData,
          bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
          trackPrice: formData.trackPrice ? parseFloat(formData.trackPrice) : 0,
          trackImage: imageUrl,
          trackFile: '',
          genreCategory: selectedGenres,
          musicianProfilePicture: musicianProfilePicture,
          publish: 'Public',
          creatorId: selectedMusician?.userId || null  // NEW: Add creator_id
        };
        response = await trackAPI.createTrack(trackData);
      }

      if (response.success) {
        const message = isEditMode ? 'Track updated successfully!' : 'Track created successfully!';
        setSubmitMessage(message);

        if (!isEditMode) {
          setFormData({
            trackName: '',
            trackId: '',
            bpm: '',
            trackKey: '',
            trackPrice: '',
            musician: '',
            trackType: '',
            moodType: '',
            energyType: '',
            about: '',
            seoTitle: '',
            metaKeyword: '',
            metaDescription: '',
            publish: 'Public'
          });
          setSelectedGenres([]);
          setTrackImage(null);
          setImageFileId(null);
          setImageFile(null);
          setTrackFile(null);
          setMusicianProfiles({});
        }

        setTimeout(() => {
          router.push('/admin/tracks');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating track:', error);
      setSubmitMessage(
        error.response?.data?.details ||
        error.response?.data?.message ||
        'Failed to create track. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-8 bg-[#081028]">
      <h1 className="text-3xl font-bold text-white mb-8">
        Track Management <span className="text-lg font-normal text-gray-400 ml-4">{isEditMode ? 'Edit Track' : 'Add Tracks'}</span>
      </h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#101936] rounded-2xl p-8 shadow-xl">
            {/* Track Name */}
            <div>
              <label className="block text-gray-300 mb-2">Track Name *</label>
              <input
                name="trackName"
                value={formData.trackName}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none"
                required
              />
            </div>

            {/* Track ID */}
            <div className="relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                Track ID *
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    This is your track's unique identifier
                  </span>
                </span>
              </label>
              <input
                name="trackId"
                value={formData.trackId}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none"
                required
              />
            </div>

            {/* BPM */}
            <div className="relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                BPM
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    Beats per minute
                  </span>
                </span>
              </label>
              <input
                name="bpm"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.bpm}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>

            {/* Track Key */}
            <div className="relative">
              <label className="block text-gray-300 mb-2">Key</label>
              <div className="relative">
                <select
                  name="trackKey"
                  value={formData.trackKey}
                  onChange={handleInputChange}
                  className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
                >
                  <option value="">Select key</option>
                  {trackKeyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <span className="pointer-events-none absolute right-4 top-3 text-gray-400 text-lg">▼</span>
              </div>
            </div>

            {/* Track Price */}
            <div>
              <label className="block text-gray-300 mb-2">Track Price</label>
              <input
                name="trackPrice"
                type="text"
                value={formData.trackPrice}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none"
              />
            </div>

            {/* Musician - SIMPLIFIED WITHOUT ADD NEW */}
            <div className="relative">
              <label className="block text-gray-300 mb-2">Musician</label>
              <select
                name="musician"
                value={formData.musician}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
                disabled={musiciansLoading}
              >
                <option value="">
                  {musiciansLoading ? 'Loading musicians...' : 'Select Musician'}
                </option>
                {musiciansData.map((musician, index) => (
                  <option key={index} value={musician.name}>
                    {musician.name}
                    {musician.stripeEnabled ? ' ✅ Ready' : ' ⚠️ No Payments'}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>

              {/* Warning if musician doesn't have Stripe and track has price */}
              {formData.musician &&
                parseFloat(formData.trackPrice) > 0 &&
                !musiciansData.find(m => m.name === formData.musician)?.stripeEnabled && (
                  <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
                    ⚠️ Warning: This musician hasn't set up payments yet. Buyers won't be able to purchase this track.
                  </div>
                )}
            </div>

            {/* Mood Type */}
            <div className="relative">
              <label className="block text-gray-300 mb-2">Mood</label>
              <select
                name="moodType"
                value={formData.moodType}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
              >
                <option value="">Select Mood</option>
                {moodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>
            </div>

            {/* Energy Type */}
            <div className="relative">
              <label className="block text-gray-300 mb-2">Energy Level</label>
              <select
                name="energyType"
                value={formData.energyType}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
              >
                <option value="">Select Energy</option>
                {energyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>
            </div>

            {/* Track Image & Audio Upload */}
            <div className="flex flex-col md:flex-row gap-6 md:col-span-2">
              {/* Track Image */}
              <div className="flex-1">
                <label className="block text-gray-300 mb-2">Track Image</label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#232B43] rounded-xl bg-[#181F36] p-4 cursor-pointer hover:border-[#E100FF] transition"
                  onClick={() => !isUploadingImage && imageInputRef.current?.click()}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-[#E100FF] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs text-gray-400">Uploading...</span>
                    </div>
                  ) : trackImage ? (
                    <img src={trackImage} alt="Track" className="w-20 h-20 object-cover rounded-lg mb-2" />
                  ) : (
                    <FaCloudUploadAlt className="text-4xl text-[#7ED7FF] mb-2" />
                  )}
                  <span className="text-xs text-gray-400">
                    {isUploadingImage ? 'Uploading...' : 'Click to upload image'}
                  </span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                  />
                </div>
              </div>

              {/* Track Upload */}
              <div className="flex-1">
                <label className="block text-gray-300 mb-2">Track Upload</label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#232B43] rounded-xl bg-[#181F36] p-4 cursor-pointer hover:border-[#E100FF] transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaFileAudio className="text-4xl text-[#E100FF] mb-2" />
                  <span className="text-xs text-gray-400">
                    {trackFile ? trackFile.name : "Click to upload audio"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/mp3,audio/wav"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="md:col-span-2 relative">
              <label className="block text-gray-300 mb-2">About</label>
              <textarea
                name="about"
                rows={4}
                value={formData.about}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none"
                placeholder="Describe your track"
              />
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Submit Section */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            {submitMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${submitMessage.includes('successfully')
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                {submitMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${isSubmitting
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-[#E100FF] text-white hover:bg-[#c800d6]'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Track...</span>
                </>
              ) : (
                <>
                  {isEditMode ? 'Update Track' : 'Add Track'} <span className="ml-2">→</span>
                </>
              )}
            </button>
          </div>

          {/* Genres Category */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="block text-gray-300 mb-2">Genres Category</label>
              <button
                type="button"
                onClick={() => setShowAddGenre(!showAddGenre)}
                className="text-[#E100FF] text-sm hover:text-[#c800d6] transition-colors"
              >
                {showAddGenre ? 'Cancel' : '+ Add New'}
              </button>
            </div>
            <input
              type="text"
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
              placeholder="Search genres..."
            />
            <label className="block text-gray-400 text-xs mb-2">All categories</label>

            {showAddGenre && (
              <div className="bg-[#232B43] rounded-lg p-4 mb-4 border border-[#E100FF]/30">
                <h4 className="text-white text-sm font-medium mb-3">Add New Genre</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Genre Name"
                    value={newGenreName}
                    onChange={(e) => setNewGenreName(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newGenreDescription}
                    onChange={(e) => setNewGenreDescription(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddGenre}
                      disabled={!newGenreName.trim() || isAddingGenre}
                      className="flex-1 bg-[#E100FF] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#c800d6] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAddingGenre ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        'Add Genre'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddGenre(false);
                        setNewGenreName('');
                        setNewGenreDescription('');
                      }}
                      className="px-3 py-2 text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-48 overflow-y-auto bg-[#181F36] rounded-lg border border-[#232B43] p-2">
              {filteredGenres.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  {genreSearch ? 'No genres found' : 'No genres available'}
                </div>
              ) : (
                filteredGenres.map(genre => (
                  <div key={genre.id} className="flex items-center gap-3 p-2 hover:bg-[#232B43] rounded cursor-pointer">
                    <input
                      type="checkbox"
                      id={`genre-${genre.id}`}
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                      className="w-4 h-4 text-[#E100FF] bg-[#232B43] border-[#232B43] rounded focus:ring-[#E100FF] focus:ring-2"
                    />
                    <label htmlFor={`genre-${genre.id}`} className="text-white text-sm cursor-pointer flex-1">
                      {genre.name}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGenres.map(genreId => {
                  const genre = genresData.find(g => g.id === genreId);
                  return genre ? (
                    <span key={genreId} className="bg-[#E100FF]/20 text-[#E100FF] px-2 py-1 rounded-full text-xs">
                      {genre.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddTrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-8 bg-[#081028] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <AddTrackForm />
    </Suspense>
  );
}