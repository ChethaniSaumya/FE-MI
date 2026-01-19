'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { musicianAPI, trackAPI, genreAPI, downloadAPI } from '../../../../utils/api';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { MdMusicNote, MdAudiotrack, MdPublic, MdDownload } from 'react-icons/md';
import { FaPlay, FaPause, FaShare } from 'react-icons/fa';


interface Musician {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    country?: string;
    genre?: string;
    socialLinks?: any;
    trackCount?: number;
}

interface Track {
    _id: string;
    trackName: string;
    musician: string;
    trackPrice: number;
    trackImage: string;
    trackFile?: string;
    genreCategory?: string;
    bpm?: number;
    key?: string;
    mood?: string;
    instruments?: string[];
    about?: string;
}

const MusicianProfilePage = () => {
    const params = useParams();
    const musicianId = params.id as string;
    
    console.log('Page params:', params);
    console.log('Musician ID from params:', musicianId);
    
    const [musician, setMusician] = useState<Musician | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Audio player state
    const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    // Helper function to get image URL
    const getImageUrl = (imageId: string) => {
        if (!imageId) return '/vercel.svg';
        if (imageId.startsWith('http')) return imageId;
        return `http://localhost:5000/api/images/${imageId}`;
    };

    // Helper function to get initials
    const getInitials = (name?: string) => {
        if (!name || name.trim() === '') return 'M';
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].charAt(0).toUpperCase();
        } else {
            const first = words[0].charAt(0).toUpperCase();
            const last = words[words.length - 1].charAt(0).toUpperCase();
            return first + last;
        }
    };

    // Helper function to get genre name from ID
    const getGenreName = (genreId?: string) => {
        if (!genreId || !genres.length) return 'Unknown Genre';
        const genre = genres.find(g => g._id === genreId);
        return genre ? genre.name : 'Unknown Genre';
    };

    // Helper function to get genre name from track genreCategory
    const getTrackGenreName = (genreCategory?: string | string[]) => {
        if (!genreCategory || !genres.length) return 'Unknown Genre';
        
        if (Array.isArray(genreCategory)) {
            // Handle array of genre IDs
            const genreNames = genreCategory.map(id => getGenreName(id)).filter(name => name !== 'Unknown Genre');
            return genreNames.length > 0 ? genreNames.join(', ') : 'Unknown Genre';
        } else {
            // Handle single genre ID
            return getGenreName(genreCategory);
        }
    };

    // Handle track play/pause
    const handlePlayPause = (track: Track) => {
        try {
            if (!track.trackFile) {
                alert('No track file available for preview');
                return;
            }

            // If clicking the same track that's currently playing, toggle play/pause
            if (currentPlayingTrack === track._id) {
                if (isPlaying) {
                    audioElement?.pause();
                    setIsPlaying(false);
                } else {
                    audioElement?.play();
                    setIsPlaying(true);
                }
                return;
            }

            // Stop current audio if playing
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }

            // Create new audio element for the selected track
            const newAudio = new Audio(track.trackFile);
            newAudio.preload = 'metadata';
            
            // Set up event listeners
            newAudio.addEventListener('loadstart', () => {
                console.log('Loading track:', track.trackName);
            });
            
            newAudio.addEventListener('canplay', () => {
                console.log('Track ready to play:', track.trackName);
            });
            
            newAudio.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentPlayingTrack(null);
                setAudioElement(null);
            });
            
            newAudio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                alert('Failed to load track for preview');
                setIsPlaying(false);
                setCurrentPlayingTrack(null);
                setAudioElement(null);
            });

            // Start playing the new track
            setCurrentPlayingTrack(track._id);
            setAudioElement(newAudio);
            newAudio.play();
            setIsPlaying(true);
            
        } catch (error) {
            console.error('Play error:', error);
            alert('Failed to play track');
        }
    };

    // Handle track download
    const handleDownload = async (track: Track) => {
        try {
            if (!track.trackFile) {
                alert('No track file available for download');
                return;
            }

            // Create a filename from track name
            const fileName = `${track.trackName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
            
            const result = await downloadAPI.downloadFile(track.trackFile, fileName);
            
            if (result.success) {
                console.log('Download started successfully');
            } else {
                alert('Failed to download track: ' + result.error);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download track');
        }
    };

    // Handle share/copy link
    const handleShare = async (track: Track) => {
        try {
            // Create a shareable link for the track
            const trackUrl = `${window.location.origin}/user/pages/topcharts?track=${encodeURIComponent(track.trackName || track._id)}`;
            
            if (navigator.share) {
                // Use native share API if available
                await navigator.share({
                    title: track.trackName || 'Track',
                    text: `Check out this track by ${musician?.name}: ${track.trackName}`,
                    url: trackUrl
                });
            } else {
                // Fallback to clipboard copy
                await navigator.clipboard.writeText(trackUrl);
                alert('Track link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share error:', error);
            // Fallback to manual copy
            const trackUrl = `${window.location.origin}/user/pages/topcharts?track=${encodeURIComponent(track.trackName || track._id)}`;
            navigator.clipboard.writeText(trackUrl).then(() => {
                alert('Track link copied to clipboard!');
            }).catch(() => {
                alert('Failed to copy link. Please try again.');
            });
        }
    };

    // Load musician data and tracks
    useEffect(() => {
        const loadMusicianData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Loading musician with ID:', musicianId);

                // Load genres first
                const genresResponse = await genreAPI.getGenres();
                if (genresResponse?.success) {
                    setGenres(genresResponse.genres || []);
                }

                // Load musician details
                const musicianResponse = await musicianAPI.getMusician(musicianId);
                console.log('Musician API response:', musicianResponse);
                
                if (musicianResponse?.success) {
                    setMusician(musicianResponse.musician);
                    
                    // Load all tracks for this musician
                    const tracksResponse = await trackAPI.getTracks();
                    console.log('Tracks API response:', tracksResponse);
                    
                    if (tracksResponse?.success && tracksResponse.tracks) {
                        const musicianTracks = tracksResponse.tracks.filter((track: Track) => 
                            track.musician && track.musician.toLowerCase() === musicianResponse.musician.name.toLowerCase()
                        );
                        console.log('Filtered tracks for musician:', musicianTracks);
                        setTracks(musicianTracks);
                    }
                } else {
                    throw new Error('Failed to load musician details');
                }

            } catch (err) {
                console.error('Error loading musician data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load musician data');
            } finally {
                setLoading(false);
            }
        };

        if (musicianId) {
            loadMusicianData();
        }
    }, [musicianId]);

    if (loading) {
        return (
            <div className="relative overflow-hidden">
                <Navbar />
                <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="ml-2 text-white">Loading musician profile...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !musician) {
        return (
            <div className="relative overflow-hidden">
                <Navbar />
                <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                    <div className="text-center py-12">
                        <div className="text-red-400 text-xl mb-4">⚠️ Error Loading Profile</div>
                        <div className="text-white/60 mb-6">{error || 'Musician not found'}</div>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-primary text-black px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors font-semibold"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
            {/* Custom CSS for line-clamp utilities */}
            <style jsx>{`
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>

            <Navbar />
            
            <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Musicians
                    </button>
                </div>

                {/* Compact Modern Musician Profile Header */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Profile Picture */}
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center relative overflow-hidden ring-4 ring-white/20 group-hover:ring-primary/40 transition-all duration-300">
                                {musician.profilePicture ? (
                                    <img 
                                        src={getImageUrl(musician.profilePicture)} 
                                        alt={musician.name} 
                                        className="w-full h-full rounded-full object-cover transition-all duration-300 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-white/30 flex items-center justify-center">
                                        <span className="text-white font-bold text-2xl drop-shadow-lg">
                                            {getInitials(musician.name)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* Status indicator */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                        </div>

                        {/* Musician Info - Compact Layout */}
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                                {musician.name}
                            </h1>
                            
                            {/* Compact Stats Row */}
                            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-3">
                                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                    <MdMusicNote className="text-lg" />
                                    {tracks.length} Tracks
                                </div>
                                {musician.genre && (
                                    <div className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <MdAudiotrack className="text-lg" />
                                        {getGenreName(musician.genre)}
                                    </div>
                                )}
                                {musician.country && (
                                    <div className="bg-white/10 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-2">
                                        <MdPublic className="text-lg" />
                                        {musician.country}
                                    </div>
                                )}
                            </div>

                            {/* Bio - Compact */}
                            {musician.bio && (
                                <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                                    {musician.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Section - Now Above Tracks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="text-3xl text-primary font-bold mb-2">{tracks.length}</div>
                        <div className="text-white/60">Total Tracks</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="text-3xl text-primary font-bold mb-2">
                            ${tracks.reduce((sum, track) => sum + (track.trackPrice || 0), 0)}
                        </div>
                        <div className="text-white/60">Total Value</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 shadow-lg">
                        <div className="text-3xl text-primary font-bold mb-2">
                            {musician.genre ? '1' : '0'}
                        </div>
                        <div className="text-white/60">Primary Genre</div>
                    </div>
                </div>

                {/* Tracks Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-white">
                            All Tracks by {musician.name}
                        </h2>
                        <div className="text-primary text-xl font-semibold">
                            {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
                        </div>
                    </div>

                    {tracks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {tracks.map((track, index) => (
                                <div 
                                    key={track._id} 
                                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/30 group border border-white/20"
                                >
                                    {/* Track Image */}
                                    <div className="relative mb-4">
                                        <div className="w-full aspect-square overflow-hidden rounded-lg bg-black/20">
                                            <img 
                                                src={getImageUrl(track.trackImage)} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                                alt={track.trackName} 
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vercel.svg'; }}
                                            />
                                        </div>
                                        
                                        {/* Track Number Badge */}
                                        <div className="absolute top-2 left-2 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full">
                                            #{index + 1}
                                        </div>
                                        
                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                                            <button
                                                onClick={() => handlePlayPause(track)}
                                                className="bg-primary text-black p-3 rounded-full hover:bg-primary/80 transition-colors"
                                                title={currentPlayingTrack === track._id && isPlaying ? 'Pause' : 'Play'}
                                            >
                                                {currentPlayingTrack === track._id && isPlaying ? (
                                                    <FaPause className="w-6 h-6" />
                                                ) : (
                                                    <FaPlay className="w-6 h-6 ml-0.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Track Info */}
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-white font-bold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                                                {track.trackName}
                                            </h4>
                                            <p className="text-gray-400 text-sm">
                                                by {track.musician}
                                            </p>
                                        </div>
                                        
                                        {/* Track Details */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Genre: {getTrackGenreName(track.genreCategory)}</span>
                                            <span>BPM: {track.bpm || 'N/A'}</span>
                                        </div>
                                        
                                        {/* Price and Actions */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex-1">
                                                <div className="text-primary font-bold text-xl">
                                                    $ {track.trackPrice || 0}
                                                </div>
                                                <div className="text-gray-400 text-xs">Price</div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleShare(track)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                                    title="Share Track"
                                                >
                                                    <FaShare className="w-4 h-4" />
                                                </button>
                                               <button 
                                                   onClick={() => handleDownload(track)}
                                                   className="bg-primary hover:bg-primary/80 text-black px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                               >
                                                   <MdDownload className="w-5 h-5" />
                                                   Download
                                               </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                            <div className="text-white/60">
                                <div className="text-6xl mb-4">🎵</div>
                                <div className="text-xl font-semibold mb-2">No tracks available</div>
                                <div className="text-sm">This musician hasn't uploaded any tracks yet.</div>
                                <div className="text-xs text-gray-500 mt-2">Check back later for new music!</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MusicianProfilePage;
