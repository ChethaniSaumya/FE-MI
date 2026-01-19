"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { FaCloudUploadAlt, FaFileAudio } from "react-icons/fa";
import { trackAPI, genreAPI, beatAPI, tagAPI, imageAPI, musicianAPI } from '../../../utils/api';
import { useRouter, useSearchParams } from "next/navigation";

const typeOptions = ["Song", "Beats", "Beats w/hook", "Top lines", "Vocal"];
const moodOptions = [
  "Bouncy", "Dark", "Energetic", "Soulful", "Inspiring", "Confident", "Sad", "Mellow", "Relaxed", "Calm", "Angry", "Happy", "Epic", "Accomplished", "Quirky", "Determined", "Crazy", "Loved", "Intense", "Powerful", "Dirty", "Lonely", "Depressed", "Hyper", "Flirty", "Grateful", "Rebellious", "Peaceful", "Evil", "Adored", "Gloomy", "Romantic", "Anxious", "Crunk", "Eccentric", "Neutral", "Exciting", "Dramatic", "Enraged", "Tense", "Majestic", "Annoyed", "Disappointed", "Lazy", "Silly", "Giddy", "Frantic", "Scared", "Scary", "Chill", "Bold", "Melancholy", "Seductive", "Dreamy", "Carefree", "Restless", "Mysterious", "Dancy", "Euphoric", "Rage", "Warm", "Optimistic", "Uplifting", "Sentimental", "Hopeful", "Cheerful", "Soothing", "Heartfelt", "Playful"
];
const energyOptions = ["High", "Medium", "Low"];
const instrumentOptions = [
  "Percussion", "Piano", "Acoustic guitar", "Bass guitar", "Electric guitar", "Strings", "Violin", "Cymbals", "Brass", "Flute", "Organ", "Bass", "Synth", "Beats", "Cello", "Trumpet", "Double Bass", "Saxophone", "Viola", "Triangle", "Recorder", "Banjo", "Guitar", "French Horn", "Keys", "Trombone", "Tambourine", "Bassoon", "Ukulele", "Harpsichord", "Tuba", "Clarinet", "Harp", "Oboe", "Harmonica", "Piccolo", "Sitar", "Maracas", "Castanets", "Mandolin", "Lute", "Gong", "Bugle"
];
const platformOptions = ["Bandcamp", "Soundcloud", "Apple Music"];
const trackKeyOptions = [
  "None", "Cm", "Dm", "Em", "Fm", "Gm", "Bm", "F♯m", "Am", "C♯m", "D♯m", "G♯m", "A♯m", "E♭m", "CM", "B♭m", "DM", "A♭m", "GM", "EM", "AM", "FM", "BM", "F♯M", "D♭m", "E♭M", "A♭M", "C♯M", "D♭M", "B♭M", "A♯M", "G♭M", "C♭M", "D♯M", "G♯M"
];

function AddTrackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Add new item states
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [showAddBeat, setShowAddBeat] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newBeatName, setNewBeatName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newGenreDescription, setNewGenreDescription] = useState('');
  const [newBeatDescription, setNewBeatDescription] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  
  // Loading states for add operations
  const [isAddingGenre, setIsAddingGenre] = useState(false);
  const [isAddingBeat, setIsAddingBeat] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  
  // Search states
  const [genreSearch, setGenreSearch] = useState('');
  const [beatSearch, setBeatSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [trackImage, setTrackImage] = useState<string | null>(null);
  const [imageFileId, setImageFileId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [genresData, setGenresData] = useState<{ id: string; name: string; description: string; color: string; isActive: boolean; }[]>([]);
  const [beatsData, setBeatsData] = useState<{ id: string; name: string; description: string; color: string; isActive: boolean; }[]>([]);
  const [tagsData, setTagsData] = useState<{ id: string; name: string; description: string; color: string; isActive: boolean; }[]>([]);
  const [musiciansData, setMusiciansData] = useState<string[]>([]);
  const [musiciansLoading, setMusiciansLoading] = useState(false);
  const [musicianProfiles, setMusicianProfiles] = useState<{ [key: string]: string }>({});
  const [newMusicianImage, setNewMusicianImage] = useState<File | null>(null);
  const [newMusicianImagePreview, setNewMusicianImagePreview] = useState<string | null>(null);
  
  // Form state
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
    instrument: '',
    generatedTrackPlatform: '',
    about: '',
    seoTitle: '',
    metaKeyword: '',
    metaDescription: ''
  });
  
  // Loading and message states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicianImageInputRef = useRef<HTMLInputElement>(null);

  const [dropdowns, setDropdowns] = useState<{
    genreOptions: string[];
    beatOptions: string[];
    tagOptions: string[];
  }>({
    genreOptions: [],
    beatOptions: [],
    tagOptions: [],
  });

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
            instrument: trackData.instrument || '',
            generatedTrackPlatform: trackData.generatedTrackPlatform || '',
            about: trackData.about || '',
            seoTitle: trackData.seoTitle || '',
            metaKeyword: trackData.metaKeyword || '',
            metaDescription: trackData.metaDescription || ''
          });


          // Set track image if available
          if (trackData.trackImage) {
            setTrackImage(trackData.trackImage);
          }

          // Set selected categories
          if (trackData.genreCategory && Array.isArray(trackData.genreCategory)) {
            setSelectedGenres(trackData.genreCategory);
          }
          if (trackData.beatCategory && Array.isArray(trackData.beatCategory)) {
            setSelectedBeats(trackData.beatCategory);
          }
          if (trackData.trackTags && Array.isArray(trackData.trackTags)) {
            setSelectedTags(trackData.trackTags);
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

    // Fetch beats from MongoDB
    const fetchBeats = async () => {
      try {
        const response = await beatAPI.getBeats();
        if (response.success) {
          setBeatsData(response.beats);
        }
      } catch (error) {
        console.error('Error fetching beats:', error);
      }
    };

    // Fetch tags from MongoDB
    const fetchTags = async () => {
      try {
        const response = await tagAPI.getTags();
        if (response.success) {
          setTagsData(response.tags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    // Fetch musicians from MongoDB
    const fetchMusicians = async () => {
      try {
        setMusiciansLoading(true);
        const response = await musicianAPI.getMusicians();
        if (response.success) {
          setMusiciansData(response.musicians.map((m: any) => m.name));
        }
      } catch (error) {
        console.error('Error fetching musicians:', error);
      } finally {
        setMusiciansLoading(false);
      }
    };

    fetchGenres();
    fetchBeats();
    fetchTags();
    fetchMusicians();
  }, [isEditMode]);



  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitMessage('Please select a valid image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setSubmitMessage('Image file size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);
    setSubmitMessage('');

    try {
      // Show preview immediately
      setTrackImage(URL.createObjectURL(file));
      setImageFile(file);

      // Upload to GridFS
      const response = await imageAPI.uploadImage(file);
      
      if (response.success) {
        setImageFileId(response.fileId);
        setSubmitMessage('Image uploaded successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSubmitMessage(error.response?.data?.message || 'Failed to upload image');
      
      // Clear error message after 5 seconds
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

  // Handle musician image change
  const handleMusicianImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitMessage('Please select a valid image file for musician profile');
      return;
    }

    // Validate file size (5MB limit for profile pictures)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitMessage('Musician profile image must be less than 5MB');
      return;
    }

    setNewMusicianImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewMusicianImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  // Handle multi-select with checkboxes
  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleBeatToggle = (beatId: string) => {
    setSelectedBeats(prev => 
      prev.includes(beatId) 
        ? prev.filter(id => id !== beatId)
        : [...prev, beatId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Filtered data based on search
  const filteredGenres = genresData.filter(genre =>
    genre.name.toLowerCase().includes(genreSearch.toLowerCase()) ||
    genre.description.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const filteredBeats = beatsData.filter(beat =>
    beat.name.toLowerCase().includes(beatSearch.toLowerCase()) ||
    beat.description.toLowerCase().includes(beatSearch.toLowerCase())
  );

  const filteredTags = tagsData.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
    tag.description.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Add new item functions
  const handleAddGenre = async () => {
    if (!newGenreName.trim() || isAddingGenre) return;
    
    setIsAddingGenre(true);
    try {
      const response = await genreAPI.createGenre({
        name: newGenreName.trim(),
        description: newGenreDescription.trim()
      });
      
      if (response.success) {
        // Add the new genre to the list and select it
        const newGenre = response.genre;
        console.log('New genre created:', newGenre);
        
        // Ensure we're using the correct ID field
        const genreId = newGenre.id;
        
        setGenresData(prev => {
          // Check if genre already exists to avoid duplicates
          const exists = prev.find(g => g.id === genreId);
          if (exists) {
            console.log('Genre already exists in state:', exists);
            return prev;
          }
          return [...prev, {
            id: genreId,
            name: newGenre.name,
            description: newGenre.description,
            color: newGenre.color,
            isActive: newGenre.isActive
          }];
        });
        
        setSelectedGenres(prev => {
          // Check if already selected to avoid duplicates
          if (prev.includes(genreId)) {
            return prev;
          }
          return [...prev, genreId];
        });
        
        // Reset form
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

  const handleAddBeat = async () => {
    if (!newBeatName.trim() || isAddingBeat) return;
    
    setIsAddingBeat(true);
    try {
      const response = await beatAPI.createBeat({
        name: newBeatName.trim(),
        description: newBeatDescription.trim()
      });
      
      if (response.success) {
        // Add the new beat to the list and select it
        const newBeat = response.beat;
        console.log('New beat created:', newBeat);
        
        // Ensure we're using the correct ID field
        const beatId = newBeat.id;
        
        setBeatsData(prev => {
          // Check if beat already exists to avoid duplicates
          const exists = prev.find(b => b.id === beatId);
          if (exists) {
            console.log('Beat already exists in state:', exists);
            return prev;
          }
          return [...prev, {
            id: beatId,
            name: newBeat.name,
            description: newBeat.description,
            color: newBeat.color,
            isActive: newBeat.isActive
          }];
        });
        
        setSelectedBeats(prev => {
          // Check if already selected to avoid duplicates
          if (prev.includes(beatId)) {
            return prev;
          }
          return [...prev, beatId];
        });
        
        // Reset form
        setNewBeatName('');
        setNewBeatDescription('');
        setShowAddBeat(false);
      }
    } catch (error) {
      console.error('Error adding beat:', error);
    } finally {
      setIsAddingBeat(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || isAddingTag) return;
    
    setIsAddingTag(true);
    try {
      const response = await tagAPI.createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim()
      });
      
      if (response.success) {
        // Add the new tag to the list and select it
        const newTag = response.tag;
        console.log('New tag created:', newTag);
        
        // Ensure we're using the correct ID field
        const tagId = newTag.id;
        
        setTagsData(prev => {
          // Check if tag already exists to avoid duplicates
          const exists = prev.find(t => t.id === tagId);
          if (exists) {
            console.log('Tag already exists in state:', exists);
            return prev;
          }
          return [...prev, {
            id: tagId,
            name: newTag.name,
            description: newTag.description,
            color: newTag.color,
            isActive: newTag.isActive
          }];
        });
        
        setSelectedTags(prev => {
          // Check if already selected to avoid duplicates
          if (prev.includes(tagId)) {
            return prev;
          }
          return [...prev, tagId];
        });
        
        // Reset form
        setNewTagName('');
        setNewTagDescription('');
        setShowAddTag(false);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    } finally {
      setIsAddingTag(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate required fields
      if (!formData.trackName || !formData.trackId || !formData.trackType) {
        setSubmitMessage('Please fill in all required fields (Track Name, Track ID, and Track Type)');
        setIsSubmitting(false);
        return;
      }
      
      // Validate musician field with debugging
      console.log('Validating musician field:');
      console.log('- formData.musician:', formData.musician);
      console.log('- formData.musician type:', typeof formData.musician);
      console.log('- formData.musician length:', formData.musician?.length);
      console.log('- formData.musician trimmed:', formData.musician?.trim());
      console.log('- musicianProfiles keys:', Object.keys(musicianProfiles));
      console.log('- musiciansData:', musiciansData);
      
      // Check if there's a musician in profiles that should be in formData
      const hasMusicianInProfiles = Object.keys(musicianProfiles).length > 0;
      const hasMusicianInData = musiciansData.length > 0;
      
      if (!formData.musician || formData.musician.trim() === '') {
        if (hasMusicianInProfiles || hasMusicianInData) {
          // There are musicians available but none selected - suggest selection
          setSubmitMessage('Please select a musician from the dropdown or create a new one');
        } else {
          setSubmitMessage('Please select or enter a musician name');
        }
        setIsSubmitting(false);
        return;
      }

      // Use GridFS image URL if available, otherwise use the image state
      const imageUrl = imageFileId ? imageAPI.getImage(imageFileId) : trackImage || '';

      // Get musician profile picture URL if available
      console.log('Extracting musician profile picture:');
      console.log('- formData.musician:', formData.musician);
      console.log('- musicianProfiles:', musicianProfiles);
      console.log('- Available keys in musicianProfiles:', Object.keys(musicianProfiles));
      console.log('- Looking for key:', formData.musician);
      console.log('- Found value:', musicianProfiles[formData.musician]);
      
      // Try to get profile picture from multiple sources
      let musicianProfilePicture = '';
      
      // First, try to get from musicianProfiles state
      if (formData.musician && musicianProfiles[formData.musician]) {
        musicianProfilePicture = musicianProfiles[formData.musician];
        console.log('- Found in musicianProfiles state:', musicianProfilePicture);
      }
      
      // If not found in state, try to get from musiciansData (might have profile pictures)
      if (!musicianProfilePicture && formData.musician) {
        // Check if we can find the musician in the current data
        const musicianData = musiciansData.find(m => m === formData.musician);
        if (musicianData) {
          console.log('- Found musician in musiciansData:', musicianData);
          // If we have profile picture data, use it
          if (musicianProfiles[musicianData]) {
            musicianProfilePicture = musicianProfiles[musicianData];
            console.log('- Found profile picture from musiciansData:', musicianProfilePicture);
          }
        }
      }
      
      // If still no profile picture, check if there's a newMusicianImage that was uploaded
      if (!musicianProfilePicture && newMusicianImage) {
        console.log('- No profile picture found, but newMusicianImage exists');
        // Try to upload it now if it wasn't uploaded before
        try {
          const imageResponse = await imageAPI.uploadImage(newMusicianImage);
          if (imageResponse.success) {
            musicianProfilePicture = imageResponse.imageUrl;
            console.log('- Uploaded newMusicianImage and got URL:', musicianProfilePicture);
            
            // Update the musicianProfiles state for future use
            setMusicianProfiles(prev => ({
              ...prev,
              [formData.musician]: musicianProfilePicture
            }));
          }
        } catch (error) {
          console.error('Error uploading newMusicianImage:', error);
        }
      }
      
      console.log('- Final musicianProfilePicture:', musicianProfilePicture);
      
      // Final fallback: If we still don't have a profile picture but have a musician,
      // try to fetch it from the API
      if (!musicianProfilePicture && formData.musician) {
        console.log('- No profile picture found, trying to fetch from API...');
        try {
          // Get all musicians to find the one we need
          const musiciansResponse = await musicianAPI.getMusicians();
          if (musiciansResponse.success && musiciansResponse.musicians) {
            const musician = musiciansResponse.musicians.find((m: any) => m.name === formData.musician);
            if (musician && musician.profilePicture) {
              musicianProfilePicture = musician.profilePicture;
              console.log('- Found profile picture from API:', musicianProfilePicture);
              
              // Update local state for future use
              setMusicianProfiles(prev => ({
                ...prev,
                [formData.musician]: musicianProfilePicture
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching musician profile from API:', error);
        }
      }
      
      console.log('- Final musicianProfilePicture after API check:', musicianProfilePicture);

      // Check if we have files to upload
      const hasFiles = trackFile || trackImage;
      
      let response;
      if (isEditMode && editingTrackId && hasFiles) {
        // For updates with files, use file upload endpoint
        const formDataToSend = new FormData();
        
        // Add all form fields
        formDataToSend.append('trackName', formData.trackName);
        formDataToSend.append('trackId', formData.trackId);
        if (formData.bpm) formDataToSend.append('bpm', formData.bpm);
        if (formData.trackKey) formDataToSend.append('trackKey', formData.trackKey);
        if (formData.trackPrice) formDataToSend.append('trackPrice', formData.trackPrice);
        if (formData.musician) formDataToSend.append('musician', formData.musician);
        formDataToSend.append('trackType', formData.trackType);
        if (formData.moodType) formDataToSend.append('moodType', formData.moodType);
        if (formData.energyType) formDataToSend.append('energyType', formData.energyType);
        if (formData.instrument) formDataToSend.append('instrument', formData.instrument);
        if (formData.generatedTrackPlatform) formDataToSend.append('generatedTrackPlatform', formData.generatedTrackPlatform);
        if (formData.about) formDataToSend.append('about', formData.about);
        if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
        if (formData.metaKeyword) formDataToSend.append('metaKeyword', formData.metaKeyword);
        if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
        if (musicianProfilePicture) formDataToSend.append('musicianProfilePicture', musicianProfilePicture);
        
        // Add array fields
        selectedGenres.forEach((genre, index) => {
          formDataToSend.append(`genre_category[${index}]`, genre);
        });
        selectedBeats.forEach((beat, index) => {
          formDataToSend.append(`beat_category[${index}]`, beat);
        });
        selectedTags.forEach((tag, index) => {
          formDataToSend.append(`track_tags[${index}]`, tag);
        });
        
        // Add files
        if (trackFile) {
          formDataToSend.append('audio', trackFile);
        }
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }
        
        response = await trackAPI.updateTrackWithFiles(editingTrackId, formDataToSend);
      } else if (isEditMode && editingTrackId) {
        // For updates without files, use regular API
        const trackData = {
          ...formData,
          bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
          trackPrice: formData.trackPrice ? parseFloat(formData.trackPrice) : 0,
          trackImage: imageUrl,
          trackFile: trackFile?.name || '',
          genreCategory: selectedGenres,
          beatCategory: selectedBeats,
          trackTags: selectedTags,
          musicianProfilePicture: musicianProfilePicture
        };
        response = await trackAPI.updateTrack(editingTrackId, trackData);
      } else if (hasFiles) {
        // Create new track with files using FormData
        const formDataToSend = new FormData();
        
        // Add all form fields
        formDataToSend.append('trackName', formData.trackName);
        formDataToSend.append('trackId', formData.trackId);
        if (formData.bpm) formDataToSend.append('bpm', formData.bpm);
        if (formData.trackKey) formDataToSend.append('trackKey', formData.trackKey);
        if (formData.trackPrice) formDataToSend.append('trackPrice', formData.trackPrice);
        if (formData.musician) formDataToSend.append('musician', formData.musician);
        formDataToSend.append('trackType', formData.trackType);
        if (formData.moodType) formDataToSend.append('moodType', formData.moodType);
        if (formData.energyType) formDataToSend.append('energyType', formData.energyType);
        if (formData.instrument) formDataToSend.append('instrument', formData.instrument);
        if (formData.generatedTrackPlatform) formDataToSend.append('generatedTrackPlatform', formData.generatedTrackPlatform);
        if (formData.about) formDataToSend.append('about', formData.about);
        if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
        if (formData.metaKeyword) formDataToSend.append('metaKeyword', formData.metaKeyword);
        if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
        if (musicianProfilePicture) formDataToSend.append('musicianProfilePicture', musicianProfilePicture);
        
        // Add array fields
        selectedGenres.forEach((genre, index) => {
          formDataToSend.append(`genreCategory[${index}]`, genre);
        });
        selectedBeats.forEach((beat, index) => {
          formDataToSend.append(`beatCategory[${index}]`, beat);
        });
        selectedTags.forEach((tag, index) => {
          formDataToSend.append(`trackTags[${index}]`, tag);
        });
        
        // Add files
        if (trackFile) {
          formDataToSend.append('audio', trackFile);
        }
        // Use the actual File object, not the preview blob URL
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }
        
        response = await trackAPI.createTrackWithFiles(formDataToSend);
      } else {
        // Create new track without files
        const trackData = {
          ...formData,
          bpm: formData.bpm ? parseInt(formData.bpm) : undefined,
          trackPrice: formData.trackPrice ? parseFloat(formData.trackPrice) : 0,
          trackImage: imageUrl,
          trackFile: '', // No file in this case
          genreCategory: selectedGenres,
          beatCategory: selectedBeats,
          trackTags: selectedTags,
          musicianProfilePicture: musicianProfilePicture
        };
        response = await trackAPI.createTrack(trackData);
      }
      
      if (response.success) {
        const message = isEditMode ? 'Track updated successfully!' : 'Track created successfully!';
        setSubmitMessage(message);
        
        if (!isEditMode) {
          // Reset form only for new tracks
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
          instrument: '',
          generatedTrackPlatform: '',
          about: '',
          seoTitle: '',
          metaKeyword: '',
          metaDescription: ''
        });
        setSelectedGenres([]);
        setSelectedBeats([]);
        setSelectedTags([]);
        setTrackImage(null);
          setImageFileId(null);
          setImageFile(null);
        setTrackFile(null);
          
          // Clear musician profile picture states
          setNewMusicianImage(null);
          setNewMusicianImagePreview(null);
          setMusicianProfiles({});
        }
        
        // Redirect back to tracks list after successful operation
        setTimeout(() => {
          router.push('/admin/tracks');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating track:', error);
      console.error('Error response:', error.response?.data);
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
              <h1 className="text-3xl font-bold text-white mb-8">Track Management <span className="text-lg font-normal text-gray-400 ml-4">{isEditMode ? 'Edit Track' : 'Add Tracks'}</span></h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#101936] rounded-2xl p-8 shadow-xl">
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
            <div className="relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                Track ID *
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    This is your track's unique identifier, used for internal organization and reference
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
            <div className="relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                BPM
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                  Beats per minute – controls the speed of your track.
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
            <div className="relative">
              <label className="block text-gray-300 mb-2">Track Key</label>
              <div className="relative">
                <select 
                  name="trackKey"
                  value={formData.trackKey}
                  onChange={handleInputChange}
                  className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
                >
                  <option value="">Select Track Key</option>
                  {trackKeyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <span className="pointer-events-none absolute right-4 top-3 text-gray-400 text-lg">▼</span>
              </div>
            </div>
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
                  <option key={index} value={musician}>
                    {musician} {musicianProfiles[musician] ? '📷' : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>
              
              {/* Current Musician Selection Display */}
              {formData.musician && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-green-400">✓ Selected: {formData.musician}</span>
                  {musicianProfiles[formData.musician] && (
                    <>
                      <img 
                        src={musicianProfiles[formData.musician]} 
                        alt={`${formData.musician} profile`} 
                        className="w-8 h-8 rounded-full object-cover border border-[#E100FF]" 
                      />
                      <span className="text-xs text-gray-400">Profile picture available</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Debug/Refresh Button for Musician Selection */}
              {Object.keys(musicianProfiles).length > 0 && !formData.musician && (
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <p className="text-xs text-yellow-400 mb-2">
                    Musicians available but none selected. Click to refresh:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const availableMusicians = Object.keys(musicianProfiles);
                      if (availableMusicians.length > 0) {
                        setFormData(prev => ({ ...prev, musician: availableMusicians[0] }));
                        setSubmitMessage('Musician selection refreshed!');
                        setTimeout(() => setSubmitMessage(''), 2000);
                      }
                    }}
                    className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
                  >
                    Refresh Selection
                  </button>
                </div>
              )}
              


              
              {/* Option to add new musician */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-gray-400 text-xs">Or add new musician:</label>
                  <span className="text-gray-500 text-xs">
                    {musiciansLoading ? 'Loading...' : `${musiciansData.length} musicians available`}
                  </span>
                </div>
                <input 
                  type="text"
                  placeholder="Enter new musician name"
                  className="w-full bg-[#232B43] text-white rounded-lg px-3 py-1 text-sm border border-[#232B43] focus:border-[#E100FF] focus:outline-none mb-2"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newMusician = e.currentTarget.value.trim();
                      if (!musiciansData.includes(newMusician)) {
                        try {
                          console.log('Adding new musician:', newMusician);
                          
                          let profilePictureUrl = '';
                          
                          // If there's a profile picture, upload it to GridFS first
                          if (newMusicianImage) {
                            console.log('Uploading profile picture...');
                            const imageResponse = await imageAPI.uploadImage(newMusicianImage);
                            if (imageResponse.success) {
                              profilePictureUrl = imageResponse.imageUrl;
                              console.log('Profile picture uploaded:', profilePictureUrl);
                            }
                          }
                          
                          // Add musician to the local list (musicians are created when tracks are created)
                          console.log('Adding musician to local state...');
                          setMusiciansData(prev => {
                            const newList = [...prev, newMusician].sort();
                            console.log('Updated musiciansData:', newList);
                            return newList;
                          });
                          
                          // Update form data with new musician
                          setFormData(prev => {
                            const updated = { ...prev, musician: newMusician };
                            console.log('Updated formData.musician:', updated.musician);
                            return updated;
                          });
                          
                          // Store the musician profile picture mapping
                          if (profilePictureUrl) {
                            setMusicianProfiles(prev => {
                              const updated = { ...prev, [newMusician]: profilePictureUrl };
                              console.log('Updated musicianProfiles:', updated);
                              return updated;
                            });
                          }
                          
                          // Clear the image states
                          setNewMusicianImage(null);
                          setNewMusicianImagePreview(null);
                          
                          // Show success message
                          setSubmitMessage('Musician added successfully! The musician will be created when you save the track.');
                          setTimeout(() => setSubmitMessage(''), 3000);
                          
                          console.log('Musician addition completed successfully');
                        } catch (error) {
                          console.error('Error adding musician:', error);
                          setSubmitMessage('Error adding musician. Please try again.');
                        }
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />

                {/* Musician Profile Picture Upload */}
                <div className="mt-2">
                  <label className="block text-gray-400 text-xs mb-1">Profile Picture (Optional):</label>
                  <div 
                    className="flex flex-col items-center justify-center border border-[#232B43] rounded-lg bg-[#232B43] p-2 cursor-pointer hover:border-[#E100FF] transition"
                    onClick={() => musicianImageInputRef.current?.click()}
                  >
                    {newMusicianImagePreview ? (
                      <img 
                        src={newMusicianImagePreview} 
                        alt="Musician Profile Preview" 
                        className="w-12 h-12 object-cover rounded-lg mb-1" 
                      />
                    ) : (
                      <FaCloudUploadAlt className="text-2xl text-[#7ED7FF] mb-1" />
                    )}
                    <span className="text-xs text-gray-400 text-center">
                      {newMusicianImagePreview ? 'Click to change' : 'Click to upload profile pic'}
                    </span>
                    <input 
                      ref={musicianImageInputRef} 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleMusicianImageChange}
                    />
                  </div>
                  
                  {/* Remove image button */}
                  {newMusicianImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewMusicianImage(null);
                        setNewMusicianImagePreview(null);
                      }}
                      className="mt-1 w-full px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Remove Profile Picture
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-gray-300 mb-2">Track Type *</label>
              <select 
                name="trackType"
                value={formData.trackType}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
                required
              >
                <option value="">Select Track Type</option>
                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>
            </div>
            <div className="relative">
              <label className="block text-gray-300 mb-2">Mood Type</label>
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
            <div className="relative">
              <label className="block text-gray-300 mb-2">Energy Type</label>
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
            <div className="relative">
              <label className="block text-gray-300 mb-2">Instrument</label>
              <select 
                name="instrument"
                value={formData.instrument}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
              >
                <option value="">Select Instrument</option>
                {instrumentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <span className="pointer-events-none absolute right-4 top-9 text-gray-400 text-lg">▼</span>
            </div>
            <div className="relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                Generated Track Platform
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    The platform used to generate this track.<br/>Ex - Boomy, Soundraw, AIVA
                  </span>
                </span>
              </label>
              <select 
                name="generatedTrackPlatform"
                value={formData.generatedTrackPlatform}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-xl px-4 py-2 border border-[#232B43] focus:border-[#E100FF] focus:ring-2 focus:ring-[#E100FF] transition-all appearance-none shadow-sm"
              >
                <option value="">Select Platform</option>
                {platformOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
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
                      <span className="text-xs text-gray-400">Uploading to GridFS...</span>
                    </div>
                  ) : trackImage ? (
                    <img src={trackImage} alt="Track" className="w-20 h-20 object-cover rounded-lg mb-2" />
                  ) : (
                    <FaCloudUploadAlt className="text-4xl text-[#7ED7FF] mb-2" />
                  )}
                  <span className="text-xs text-gray-400">
                    {isUploadingImage ? 'Uploading...' : 'Click or drag to upload image'}
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
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  Track Upload
                  <span className="relative group cursor-pointer">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                    <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                      Accepted formats: MP3, WAV, max 20MB.
                    </span>
                  </span>
                </label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#232B43] rounded-xl bg-[#181F36] p-4 cursor-pointer hover:border-[#E100FF] transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaFileAudio className="text-4xl text-[#E100FF] mb-2" />
                  <span className="text-xs text-gray-400">
                    {trackFile ? trackFile.name : "Click or drag to upload audio file"}
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
            <div className="md:col-span-2 relative">
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                About
                <span className="relative group cursor-pointer">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#232B43] text-xs text-[#7ED7FF]">i</span>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#232B43] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                    Describe your track: genre, instruments, mood, or any special production notes.
                  </span>
                </span>
              </label>
              <textarea 
                name="about"
                rows={4} 
                value={formData.about}
                onChange={handleInputChange}
                className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 focus:outline-none" 
                placeholder="Describe your track, genre, instruments, mood or any special production notes." 
              />
            </div>
          </div>
        </div>
        {/* Right: Sidebar Sections */}
        <div className="flex flex-col gap-8">
          {/* Submit Section */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            {submitMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                submitMessage.includes('successfully') 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {submitMessage}
              </div>
            )}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                isSubmitting 
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
            
            {/* Add New Genre Form */}
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
                  {genreSearch ? 'No genres found matching your search' : 'No genres available'}
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
          {/* Beat Category */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="block text-gray-300 mb-2">Beat Category</label>
              <button
                type="button"
                onClick={() => setShowAddBeat(!showAddBeat)}
                className="text-[#E100FF] text-sm hover:text-[#c800d6] transition-colors"
              >
                {showAddBeat ? 'Cancel' : '+ Add New'}
              </button>
            </div>
            <input 
              type="text"
              value={beatSearch}
              onChange={(e) => setBeatSearch(e.target.value)}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-[#E100FF]" 
              placeholder="Search beats..." 
            />
            <label className="block text-gray-400 text-xs mb-2">All categories</label>
            
            {/* Add New Beat Form */}
            {showAddBeat && (
              <div className="bg-[#232B43] rounded-lg p-4 mb-4 border border-[#E100FF]/30">
                <h4 className="text-white text-sm font-medium mb-3">Add New Beat Category</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Beat Category Name"
                    value={newBeatName}
                    onChange={(e) => setNewBeatName(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newBeatDescription}
                    onChange={(e) => setNewBeatDescription(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddBeat}
                      disabled={!newBeatName.trim() || isAddingBeat}
                      className="flex-1 bg-[#E100FF] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#c800d6] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAddingBeat ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        'Add Beat'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBeat(false);
                        setNewBeatName('');
                        setNewBeatDescription('');
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
              {filteredBeats.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  {beatSearch ? 'No beats found matching your search' : 'No beats available'}
                </div>
              ) : (
                filteredBeats.map(beat => (
                <div key={beat.id} className="flex items-center gap-3 p-2 hover:bg-[#232B43] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    id={`beat-${beat.id}`}
                    checked={selectedBeats.includes(beat.id)}
                    onChange={() => handleBeatToggle(beat.id)}
                    className="w-4 h-4 text-[#E100FF] bg-[#232B43] border-[#232B43] rounded focus:ring-[#E100FF] focus:ring-2"
                  />
                  <label htmlFor={`beat-${beat.id}`} className="text-white text-sm cursor-pointer flex-1">
                    {beat.name}
                  </label>
                </div>
                ))
              )}
            </div>
            {selectedBeats.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedBeats.map(beatId => {
                  const beat = beatsData.find(b => b.id === beatId);
                  return beat ? (
                    <span key={beatId} className="bg-[#E100FF]/20 text-[#E100FF] px-2 py-1 rounded-full text-xs">
                      {beat.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          {/* Track Tags */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="block text-gray-300 mb-2">Track Tags</label>
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                className="text-[#E100FF] text-sm hover:text-[#c800d6] transition-colors"
              >
                {showAddTag ? 'Cancel' : '+ Add New'}
              </button>
            </div>
            <input 
              type="text"
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-1 focus:ring-[#E100FF]" 
              placeholder="Search tags..." 
            />
            <label className="block text-gray-400 text-xs mb-2">All categories</label>
            
            {/* Add New Tag Form */}
            {showAddTag && (
              <div className="bg-[#232B43] rounded-lg p-4 mb-4 border border-[#E100FF]/30">
                <h4 className="text-white text-sm font-medium mb-3">Add New Tag</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tag Name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    className="w-full bg-[#181F36] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E100FF]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTagName.trim() || isAddingTag}
                      className="flex-1 bg-[#E100FF] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-[#c800d6] transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAddingTag ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        'Add Tag'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTag(false);
                        setNewTagName('');
                        setNewTagDescription('');
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
              {filteredTags.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4">
                  {tagSearch ? 'No tags found matching your search' : 'No tags available'}
                </div>
              ) : (
                filteredTags.map(tag => (
                <div key={tag.id} className="flex items-center gap-3 p-2 hover:bg-[#232B43] rounded cursor-pointer">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="w-4 h-4 text-[#E100FF] bg-[#232B43] border-[#232B43] rounded focus:ring-[#E100FF] focus:ring-2"
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-white text-sm cursor-pointer flex-1">
                    {tag.name}
                  </label>
                </div>
                ))
              )}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map(tagId => {
                  const tag = tagsData.find(t => t.id === tagId);
                  return tag ? (
                    <span key={tagId} className="bg-[#E100FF]/20 text-[#E100FF] px-2 py-1 rounded-full text-xs">
                      {tag.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
          {/* SEO Setting */}
          <div className="bg-[#101936] rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <label className="block text-gray-300 mb-2">Seo Setting</label>
            <input 
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2" 
              placeholder="Seo Title" 
            />
            <input 
              name="metaKeyword"
              value={formData.metaKeyword}
              onChange={handleInputChange}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2" 
              placeholder="Meta keyword" 
            />
            <input 
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              className="w-full bg-[#181F36] text-white rounded-lg px-4 py-2 mb-2" 
              placeholder="Meta description" 
            />
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