"use client";
import React, { useEffect, useState } from "react";

import { trackAPI, imageAPI, genreAPI, beatAPI, tagAPI } from "../../utils/api";

import { FaEye, FaEdit, FaTrash, FaTimes, FaPlus, FaPlay, FaPause } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Track {
  id?: string; // Supabase ID
  _id?: string; // MongoDB ID (for backward compatibility)
  trackName: string;
  trackId: string;
  bpm?: number;
  trackKey?: string;
  trackPrice?: number;
  musician?: string;
  trackType: string;
  moodType?: string;
  energyType?: string;
  instrument?: string;
  generatedTrackPlatform?: string;
  trackImage?: string;
  trackFile?: string;
  about?: string;
  publish?: string;
  genreCategory?: string[];
  beatCategory?: string[];
  trackTags?: string[];
  seoTitle?: string;
  metaKeyword?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt?: string;
}


export default function TracksPage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data for converting IDs to names
  const [genres, setGenres] = useState<Array<{id: string, name: string}>>([]);
  const [beats, setBeats] = useState<Array<{id: string, name: string}>>([]);
  const [tags, setTags] = useState<Array<{id: string, name: string}>>([]);

  // Helper function to get track ID (supports both Supabase and MongoDB)
  const getTrackId = (track: Track): string => {
    return track.id || track._id || '';
  };

  // Audio player states
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const pageSize = 8;

  // Helper function to get proper image URL
  const getImageUrl = (trackImage: string | null | undefined) => {
    console.log('Getting track image URL for:', trackImage);
    
    if (!trackImage) return "/vercel.svg";
    
    // If it's already a full URL, return it
    if (trackImage.startsWith('http://') || trackImage.startsWith('https://')) {
      console.log('Returning full URL:', trackImage);
      return trackImage;
    }
    
    // If it's a GridFS file ID, construct the URL
    if (trackImage.length === 24) { // MongoDB ObjectId length
      const gridfsUrl = imageAPI.getImage(trackImage);
      console.log('Constructed GridFS URL:', gridfsUrl);
      return gridfsUrl;
    }
    
    // If it's a relative path or other format, return as is
    console.log('Returning as-is:', trackImage);
    return trackImage;
  };

  useEffect(() => {
    loadTracks();
    loadGenres();
    loadBeats();
    loadTags();
  }, []);

  async function loadTracks() {
    try {
      setLoading(true);
      const response = await trackAPI.getTracks();
      if (response.success) {
        setTracks(response.tracks);
      } else {
        setMessage('Failed to load tracks');
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      setMessage('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }

  async function loadGenres() {
    try {
      const response = await genreAPI.getGenres();
      if (response.success) {
        setGenres(response.genres);
      }
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  }

  async function loadBeats() {
    try {
      const response = await beatAPI.getBeats();
      if (response.success) {
        setBeats(response.beats);
      }
    } catch (error) {
      console.error('Error loading beats:', error);
    }
  }

  async function loadTags() {
    try {
      const response = await tagAPI.getTags();
      if (response.success) {
        setTags(response.tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  // Helper functions to convert IDs to names
  const getGenreName = (id: string) => {
    const genre = genres.find(g => g.id === id);
    return genre ? genre.name : id;
  };

  const getBeatName = (id: string) => {
    const beat = beats.find(b => b.id === id);
    return beat ? beat.name : id;
  };

  const getTagName = (id: string) => {
    const tag = tags.find(t => t.id === id);
    return tag ? tag.name : id;
  };

  const totalPages = Math.ceil(tracks.length / pageSize);

  const paginatedTracks = tracks.slice((page - 1) * pageSize, page * pageSize);


  const handleViewTrack = (track: Track) => {
    setSelectedTrack(track);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedTrack(null);
  };

  const handleEditTrack = (track: Track) => {
    // Store track data in localStorage for editing
    localStorage.setItem('editTrackData', JSON.stringify(track));
    // Navigate to add track page
    router.push('/admin/tracks/add?mode=edit');
  };

  const openDeleteModal = (track: Track) => {
    setDeletingTrack(track);
    setShowDeleteModal(true);
    setMessage(''); // Clear any existing messages
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingTrack(null);
    setMessage('');
  };

  const handleDeleteTrack = async () => {
    if (!deletingTrack) return;
    
    setIsDeleting(true);
    try {
      const trackId = getTrackId(deletingTrack);
      console.log('Deleting track with ID:', trackId);
      console.log('Track object:', deletingTrack);
      
      if (!trackId) {
        setMessage('Error: Track ID not found');
        setIsDeleting(false);
        return;
      }
      
      const response = await trackAPI.deleteTrack(trackId);
      if (response.success) {
        setMessage('Track deleted successfully!');
        // Remove from local state
        setTracks(prev => prev.filter(track => getTrackId(track) !== trackId));
        closeDeleteModal();
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error deleting track:', error);
      console.error('Error response:', error.response?.data);
      setMessage(error.response?.data?.message || 'Failed to delete track');
    } finally {
      setIsDeleting(false);
    }
  };

  // Audio player functions
  const getTrackFileUrl = (trackFile: string | undefined) => {
    if (!trackFile) return null;
    
    // If it's already a full URL, return it
    if (trackFile.startsWith('http://') || trackFile.startsWith('https://')) {
      return trackFile;
    }
    
    // If it's a GridFS file ID, construct the URL (similar to image API)
    if (trackFile.length === 24) { // MongoDB ObjectId length
      // Assuming there's a similar API for audio files
      return `http://localhost:3001/api/audio/${trackFile}`;
    }
    
    return trackFile;
  };

  const handlePlayTrack = async (track: Track) => {
    const trackFileUrl = getTrackFileUrl(track.trackFile);
    
    if (!trackFileUrl) {
      setMessage('No audio file available for this track');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Get track ID using helper function
    const trackId = getTrackId(track);
    
    // If the same track is already playing, pause it
    if (currentPlayingTrack === trackId && isPlaying && audioRef) {
      audioRef.pause();
      setIsPlaying(false);
      return;
    }

    // Stop any currently playing audio
    if (audioRef) {
      audioRef.pause();
    }

    // Create new audio element
    const audio = new Audio(trackFileUrl);
    
    audio.onplay = () => {
      setIsPlaying(true);
      setCurrentPlayingTrack(trackId);
    };
    
    audio.onpause = () => {
      setIsPlaying(false);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentPlayingTrack(null);
    };

    audio.onerror = () => {
      setMessage('Error playing audio file');
      setIsPlaying(false);
      setCurrentPlayingTrack(null);
      setTimeout(() => setMessage(''), 3000);
    };

    setAudioRef(audio);
    
    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setMessage('Error playing audio file');
      setTimeout(() => setMessage(''), 3000);
    }
  };


  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#081028]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Track Management <span className="text-lg font-normal text-gray-400 ml-4">All Tracks</span></h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search tracks..."
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-[#181F36] text-sm text-white placeholder-gray-400 focus:outline-none border border-[#232B43]"
          />
          <Link
            href="/admin/tracks/add"
            className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-secondary/80 transition-colors justify-center"
          >
            <FaPlus />
            Add Track
          </Link>
        </div>
      </div>
      
      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('successfully') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      )}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-[#081028]">
          {/* Table for md+ screens */}
          <table className="min-w-full text-white hidden md:table">
          <thead>
            <tr className="bg-[#232B43] text-[#C7C7C7] text-left text-sm">
              <th className="px-6 py-4 font-semibold">Track Image</th>
              <th className="px-6 py-4 font-semibold">Track ID</th>
              <th className="px-6 py-4 font-semibold">Track Name</th>
              <th className="px-6 py-4 font-semibold">Musician</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Track Key</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTracks.map((track, idx) => (
              <tr
                key={getTrackId(track)}
                className={
                  idx % 2 === 0
                    ? "bg-[#101936] hover:bg-[#232B43] transition-colors"
                    : "bg-[#081028] hover:bg-[#232B43] transition-colors"
                }
              >
                <td className="px-6 py-4">
                  <div className="relative w-10 h-10 group">
                    <img 
                      src={getImageUrl(track.trackImage)} 
                      alt="Track" 
                      className="w-10 h-10 rounded-full border-2 border-[#E100FF] bg-white object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = "/vercel.svg";
                      }}
                    />
                    {/* Play Button Overlay */}
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="absolute inset-0 w-10 h-10 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white hover:bg-black/70"
                      title={currentPlayingTrack === getTrackId(track) && isPlaying ? "Pause" : "Play"}
                    >
                      {currentPlayingTrack === getTrackId(track) && isPlaying ? (
                        <FaPause className="text-xs" />
                      ) : (
                        <FaPlay className="text-xs ml-0.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono">{track.trackId}</td>
                <td className="px-6 py-4">{track.trackName}</td>
                <td className="px-6 py-4 text-[#7ED7FF]">{track.musician}</td>
                <td className="px-6 py-4 text-[#E100FF] font-semibold">{track.trackPrice}</td>
                <td className="px-6 py-4">{track.trackKey}</td>
                <td className="px-6 py-4 flex gap-4 text-lg">
                  <button 
                    className="text-white hover:text-[#7ED7FF] transition-colors" 
                    title="View"
                    onClick={() => handleViewTrack(track)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="text-white hover:text-[#E100FF] transition-colors" 
                    title="Edit"
                    onClick={() => handleEditTrack(track)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-white hover:text-red-500 transition-colors" 
                    title="Delete"

                    onClick={() => openDeleteModal(track)}

                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Cards for mobile screens */}
        <div className="md:hidden flex flex-col gap-4 p-2">
          {paginatedTracks.map((track, idx) => (
            <div key={track._id} className="bg-[#101936] rounded-2xl shadow-xl p-4 flex flex-col gap-2">
              <div className="flex items-center gap-4 mb-2">
                <img 
                  src={getImageUrl(track.trackImage)} 
                  alt="Track" 
                  className="w-14 h-14 rounded-full border-2 border-[#E100FF] bg-white object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "/vercel.svg";
                  }}
                />
                <div>
                  <div className="font-bold text-white">{track.trackName}</div>
                  <div className="text-xs text-[#7ED7FF]">{track.musician}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">Track ID: <span className="text-white font-mono">{track.trackId}</span></div>
              <div className="text-sm text-gray-400">Price: <span className="text-[#E100FF] font-semibold">{track.trackPrice}</span></div>
              <div className="text-sm text-gray-400">Track Key: <span className="text-white">{track.trackKey}</span></div>
              <div className="flex gap-4 mt-2">
                <button 
                  className="text-white hover:text-[#7ED7FF] transition-colors" 
                  title="View"
                  onClick={() => handleViewTrack(track)}
                >
                  <FaEye />
                </button>
                <button 
                  className="text-white hover:text-[#E100FF] transition-colors" 
                  title="Edit"
                  onClick={() => handleEditTrack(track)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="text-white hover:text-red-500 transition-colors" 
                  title="Delete"

                  onClick={() => openDeleteModal(track)}

                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Pagination */}
      {!loading && tracks.length > 0 && (
      <div className="flex items-center justify-between mt-6 text-white">
        <span className="text-sm text-gray-400">
          Showing data {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, tracks.length)} of {tracks.length} entries
        </span>
        <div className="flex gap-2 items-center">
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${page === 1 ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${page === i + 1 ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#E100FF] hover:text-white'} transition-colors`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={`w-8 h-8 rounded-full flex items-center justify-center ${page === totalPages ? 'bg-[#232B43] text-gray-500' : 'bg-[#232B43] hover:bg-[#E100FF] hover:text-white'} transition-colors`}
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      )}

      {/* View Track Modal */}
      {showViewModal && selectedTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Track Details</h2>
              <button
                onClick={closeViewModal}

                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Track Image */}
              <div className="flex justify-center">
                <img 
                  src={getImageUrl(selectedTrack.trackImage)} 
                  alt="Track" 
                  className="w-48 h-48 rounded-lg border-2 border-[#E100FF] bg-white object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "/vercel.svg";
                  }}
                />
              </div>

              {/* Track Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedTrack.trackName}</h3>
                  <p className="text-gray-400 text-sm">Track ID: {selectedTrack.trackId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Musician:</span>
                    <p className="text-white">{selectedTrack.musician || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Price:</span>
                    <p className="text-[#E100FF] font-semibold">${selectedTrack.trackPrice || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">BPM:</span>
                    <p className="text-white">{selectedTrack.bpm || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Key:</span>
                    <p className="text-white">{selectedTrack.trackKey || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white">{selectedTrack.trackType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Mood:</span>
                    <p className="text-white">{selectedTrack.moodType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Energy:</span>
                    <p className="text-white">{selectedTrack.energyType || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Instrument:</span>
                    <p className="text-white">{selectedTrack.instrument || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Platform:</span>
                    <p className="text-white">{selectedTrack.generatedTrackPlatform || 'N/A'}</p>
                  </div>
                </div>

                {selectedTrack.about && (
                  <div>
                    <span className="text-gray-400">About:</span>
                    <p className="text-white text-sm mt-1">{selectedTrack.about}</p>
                  </div>
                )}

                {selectedTrack.genreCategory && selectedTrack.genreCategory.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTrack.genreCategory.map((genreId, index) => (
                        <span key={index} className="px-2 py-1 bg-[#232B43] text-white text-xs rounded-full">
                          {getGenreName(genreId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTrack.beatCategory && selectedTrack.beatCategory.length > 0 && (
                  <div>
                    <span className="text-gray-400">Beats:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTrack.beatCategory.map((beatId, index) => (
                        <span key={index} className="px-2 py-1 bg-[#232B43] text-white text-xs rounded-full">
                          {getBeatName(beatId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTrack.trackTags && selectedTrack.trackTags.length > 0 && (
                  <div>
                    <span className="text-gray-400">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTrack.trackTags.map((tagId, index) => (
                        <span key={index} className="px-2 py-1 bg-[#232B43] text-white text-xs rounded-full">
                          {getTagName(tagId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Created: {new Date(selectedTrack.createdAt).toLocaleDateString()}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101936] rounded-2xl p-6 sm:p-8 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Delete Track</h2>
                <p className="text-gray-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-[#181F36] rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Track Details:</h3>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">Name:</span> {deletingTrack.trackName}</p>
              <p className="text-gray-300 mb-1"><span className="text-gray-400">ID:</span> {deletingTrack.trackId}</p>
              <p className="text-gray-300"><span className="text-gray-400">Musician:</span> {deletingTrack.musician || 'N/A'}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-[#232B43] text-white font-semibold hover:bg-[#181F36] transition-colors disabled:opacity-50"

              >
                Cancel
              </button>
              <button

                onClick={handleDeleteTrack}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  'Delete Track'
                )}

              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 