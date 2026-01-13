'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  FaCloudUploadAlt, 
  FaMusic, 
  FaImage, 
  FaDollarSign,
  FaInfoCircle,
  FaCheck,
  FaTimes,
  FaSpinner
} from 'react-icons/fa'
import { genreAPI, beatAPI, tagAPI } from '../../../utils/api'

const TRACK_TYPES = ['Beats', 'Beats w/hook', 'Song', 'Top lines', 'Instrumental'];
const MOOD_TYPES = ['Chill', 'Energetic', 'Dark', 'Happy', 'Sad', 'Aggressive', 'Romantic', 'Uplifting', 'Mysterious', 'Peaceful'];
const ENERGY_TYPES = ['Low', 'Medium', 'High'];
const KEYS = ['CM', 'Dm', 'Em', 'FM', 'GM', 'Am', 'Bm', 'C#m', 'D#m', 'F#m', 'G#m', 'A#m', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

export default function UploadTrack() {
  const router = useRouter();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>('');

  const [genres, setGenres] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    trackName: '',
    trackPrice: '',
    bpm: '',
    trackKey: '',
    trackType: 'Beats',
    moodType: '',
    energyType: 'Medium',
    instrument: '',
    about: '',
    publish: 'Private'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const [genresRes, beatsRes, tagsRes] = await Promise.all([
        genreAPI.getGenres(),
        beatAPI.getBeats(),
        tagAPI.getTags()
      ]);
      if (genresRes.success) setGenres(genresRes.genres);
      if (beatsRes.success) setBeats(beatsRes.beats);
      if (tagsRes.success) setTags(tagsRes.tags);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setSubmitMessage('Please select a valid audio file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setSubmitMessage('Audio file must be less than 50MB');
      return;
    }
    setAudioFile(file);
    setSubmitMessage('');
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSubmitMessage('Please select a valid image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSubmitMessage('Image must be less than 10MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setSubmitMessage('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (id: string, type: 'genre' | 'beat' | 'tag') => {
    if (type === 'genre') {
      setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
    } else if (type === 'beat') {
      setSelectedBeats(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
    } else {
      setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    }
  };

  const calculatePrices = () => {
    const basePrice = parseFloat(formData.trackPrice) || 0;
    return {
      personal: basePrice,
      commercial: Math.round(basePrice * 2.5 * 100) / 100,
      exclusive: Math.round(basePrice * 10 * 100) / 100
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setSubmitMessage('Please log in to upload tracks'); return; }
    if (!audioFile) { setSubmitMessage('Please select an audio file'); return; }
    if (!formData.trackName.trim()) { setSubmitMessage('Please enter a track name'); return; }
    if (!formData.trackPrice || parseFloat(formData.trackPrice) <= 0) { setSubmitMessage('Please enter a valid price'); return; }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('userId', user.id);
      formDataToSend.append('audio', audioFile);
      if (imageFile) formDataToSend.append('image', imageFile);
      formDataToSend.append('trackName', formData.trackName);
      formDataToSend.append('trackPrice', formData.trackPrice);
      if (formData.bpm) formDataToSend.append('bpm', formData.bpm);
      if (formData.trackKey) formDataToSend.append('trackKey', formData.trackKey);
      formDataToSend.append('trackType', formData.trackType);
      if (formData.moodType) formDataToSend.append('moodType', formData.moodType);
      formDataToSend.append('energyType', formData.energyType);
      if (formData.about) formDataToSend.append('about', formData.about);
      formDataToSend.append('publish', formData.publish);
      formDataToSend.append('genreCategory', JSON.stringify(selectedGenres));
      formDataToSend.append('beatCategory', JSON.stringify(selectedBeats));
      formDataToSend.append('trackTags', JSON.stringify(selectedTags));

      const response = await fetch('http://localhost:3001/api/user-tracks', {
        method: 'POST',
        body: formDataToSend
      });
      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setSubmitMessage('Track uploaded successfully!');
        setTimeout(() => router.push('/user/pages/MyTracks'), 2000);
      } else {
        setSubmitMessage(data.message || 'Failed to upload track');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitMessage('Failed to upload track. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prices = calculatePrices();

  return (
    <div className="min-h-screen bg-[#081028]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Upload Track</h1>
          <p className="text-gray-400">Upload your track and start selling on Museedle</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaMusic className="text-[#E100FF]" /> Audio File *
              </h3>
              <div onClick={() => audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${audioFile ? 'border-green-500/50 bg-green-500/5' : 'border-[#232B43] hover:border-[#E100FF]/50'}`}>
                {audioFile ? (
                  <div>
                    <FaCheck className="text-green-400 text-3xl mx-auto mb-2" />
                    <p className="text-white font-medium">{audioFile.name}</p>
                    <p className="text-gray-400 text-sm">{(audioFile.size / 1024 / 1024).toFixed(2)} MB {audioDuration && `• ${audioDuration}`}</p>
                  </div>
                ) : (
                  <div>
                    <FaCloudUploadAlt className="text-[#E100FF] text-4xl mx-auto mb-2" />
                    <p className="text-white">Click to upload audio</p>
                    <p className="text-gray-400 text-sm">MP3, WAV up to 50MB</p>
                  </div>
                )}
              </div>
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
            </div>

            <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FaImage className="text-[#7ED7FF]" /> Cover Image
              </h3>
              <div onClick={() => imageInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${imagePreview ? 'border-green-500/50 bg-green-500/5' : 'border-[#232B43] hover:border-[#7ED7FF]/50'}`}>
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto mb-2" />
                    <p className="text-white font-medium">{imageFile?.name}</p>
                  </div>
                ) : (
                  <div>
                    <FaImage className="text-[#7ED7FF] text-4xl mx-auto mb-2" />
                    <p className="text-white">Click to upload cover</p>
                    <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          {/* Track Details */}
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] mb-8">
            <h3 className="text-white font-semibold mb-6">Track Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Track Name *</label>
                <input type="text" name="trackName" value={formData.trackName} onChange={handleInputChange} placeholder="Enter track name" className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Track Type</label>
                <select name="trackType" value={formData.trackType} onChange={handleInputChange} className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none">
                  {TRACK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">BPM</label>
                <input type="number" name="bpm" value={formData.bpm} onChange={handleInputChange} placeholder="e.g. 120" min="1" max="300" className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Key</label>
                <select name="trackKey" value={formData.trackKey} onChange={handleInputChange} className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none">
                  <option value="">Select key</option>
                  {KEYS.map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Mood</label>
                <select name="moodType" value={formData.moodType} onChange={handleInputChange} className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none">
                  <option value="">Select mood</option>
                  {MOOD_TYPES.map(mood => <option key={mood} value={mood}>{mood}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Energy Level</label>
                <select name="energyType" value={formData.energyType} onChange={handleInputChange} className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none">
                  {ENERGY_TYPES.map(energy => <option key={energy} value={energy}>{energy}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-gray-300 text-sm mb-2">Description</label>
              <textarea name="about" value={formData.about} onChange={handleInputChange} placeholder="Describe your track..." rows={3} className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none resize-none" />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] mb-8">
            <h3 className="text-white font-semibold mb-6">Categories & Tags</h3>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-3">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button key={genre.id} type="button" onClick={() => toggleCategory(genre.id, 'genre')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedGenres.includes(genre.id) ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#E100FF]/20'}`}>
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-3">Beat Categories</label>
              <div className="flex flex-wrap gap-2">
                {beats.map(beat => (
                  <button key={beat.id} type="button" onClick={() => toggleCategory(beat.id, 'beat')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedBeats.includes(beat.id) ? 'bg-[#7ED7FF] text-black' : 'bg-[#232B43] text-gray-300 hover:bg-[#7ED7FF]/20'}`}>
                    {beat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-3">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button key={tag.id} type="button" onClick={() => toggleCategory(tag.id, 'tag')}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTags.includes(tag.id) ? 'bg-[#FF6B35] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#FF6B35]/20'}`}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] mb-8">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2"><FaDollarSign className="text-green-400" /> Pricing</h3>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">Base Price (Personal License) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" name="trackPrice" value={formData.trackPrice} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg pl-8 pr-4 py-3 text-white focus:border-[#E100FF] focus:outline-none" required />
              </div>
            </div>
            {formData.trackPrice && parseFloat(formData.trackPrice) > 0 && (
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3"><FaInfoCircle className="text-[#7ED7FF]" /><span className="text-gray-300 text-sm">License Price Preview</span></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center"><p className="text-gray-400 text-xs mb-1">Personal</p><p className="text-white font-bold">${prices.personal.toFixed(2)}</p><p className="text-gray-500 text-xs">1x</p></div>
                  <div className="text-center"><p className="text-gray-400 text-xs mb-1">Commercial</p><p className="text-[#7ED7FF] font-bold">${prices.commercial.toFixed(2)}</p><p className="text-gray-500 text-xs">2.5x</p></div>
                  <div className="text-center"><p className="text-gray-400 text-xs mb-1">Exclusive</p><p className="text-[#E100FF] font-bold">${prices.exclusive.toFixed(2)}</p><p className="text-gray-500 text-xs">10x</p></div>
                </div>
              </div>
            )}
          </div>

          {/* Publish Settings */}
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] mb-8">
            <h3 className="text-white font-semibold mb-4">Visibility</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="publish" value="Private" checked={formData.publish === 'Private'} onChange={handleInputChange} className="w-4 h-4 accent-[#E100FF]" />
                <span className="text-white">Private</span><span className="text-gray-400 text-sm">(Only you can see)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="publish" value="Public" checked={formData.publish === 'Public'} onChange={handleInputChange} className="w-4 h-4 accent-[#E100FF]" />
                <span className="text-white">Public</span><span className="text-gray-400 text-sm">(Listed in marketplace)</span>
              </label>
            </div>
          </div>

          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${submitSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {submitSuccess ? <FaCheck /> : <FaTimes />} {submitMessage}
            </div>
          )}

          <div className="flex gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-[#232B43] text-white rounded-lg hover:bg-[#232B43]/80 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-[#E100FF] to-[#7C3AED] text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting ? (<><FaSpinner className="animate-spin" /> Uploading...</>) : (<><FaCloudUploadAlt /> Upload Track</>)}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}