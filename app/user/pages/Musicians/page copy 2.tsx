'use client'
import React, { useState, useEffect } from 'react'
import Navbar from '@/app/user/components/Navbar'
import Footer from '@/app/user/components/Footer'
import Music from '../../images/icon/cd.png'
import Downloadicon from '../../images/icon/Download.svg'
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri"
import { trackAPI, imageAPI, musicianAPI, downloadAPI, genreAPI } from '../../../utils/api'
import { FaPlay, FaPause } from 'react-icons/fa'

function page() {
    // State for musicians data
    const [musicians, setMusicians] = useState<any[]>([]);
    const [musiciansLoading, setMusiciansLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [cardsPerPage, setCardsPerPage] = useState(4);
    const [musicianPages, setMusicianPages] = useState<{ [key: string]: number }>({});
    
    // Genre data for resolving genre IDs to names
    const [genresMap, setGenresMap] = useState<{ [key: string]: string }>({});
    
    // Search state for musicians
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Audio player state
    const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    
    // State for tracks by musician
    const [tracksByMusician, setTracksByMusician] = useState<{ [key: string]: any[] }>({});
    const [tracksLoading, setTracksLoading] = useState<{ [key: string]: boolean }>({});

    // Load genres first
    useEffect(() => {
        const loadGenres = async () => {
            try {
                const response = await genreAPI.getGenres();
                if (response?.success && response.genres) {
                    const genreMap: { [key: string]: string } = {};
                    response.genres.forEach((genre: any) => {
                        genreMap[genre.id || genre._id] = genre.name;
                    });
                    setGenresMap(genreMap);
                    console.log('Loaded genres map:', genreMap);
                }
            } catch (error) {
                console.error('Error loading genres:', error);
            }
        };
        
        loadGenres();
    }, []);

    // Load musicians from MongoDB
    useEffect(() => {
        const loadMusicians = async () => {
            try {
                setMusiciansLoading(true);
                const response = await musicianAPI.getMusicians();
                if (response?.success) {
                    setMusicians(response.musicians || []);
                    console.log('Loaded musicians from MongoDB:', response.musicians);
                    
                    // Load tracks for each musician
                    await loadTracksForMusicians(response.musicians || []);
                } else {
                    console.error('Failed to load musicians:', response);
                }
            } catch (error) {
                console.error('Error loading musicians:', error);
            } finally {
                setMusiciansLoading(false);
            }
        };
        
        loadMusicians();
    }, []);

    // Load tracks for all musicians with genre resolution
    const loadTracksForMusicians = async (musiciansList: any[]) => {
        try {
            const allTracksResponse = await trackAPI.getTracks();
            if (allTracksResponse?.success && allTracksResponse.tracks) {
                const tracks = allTracksResponse.tracks;
                const tracksByMusicianMap: { [key: string]: any[] } = {};
                
                musiciansList.forEach(musician => {
                    if (musician.name) {
                        const musicianTracks = tracks.filter((track: any) => 
                            track.musician && track.musician.toLowerCase() === musician.name.toLowerCase()
                        ).map((track: any) => {
                            // Resolve genre names from IDs
                            const genreNames = Array.isArray(track.genreCategory) 
                                ? track.genreCategory
                                    .map((genreId: string) => genresMap[genreId])
                                    .filter(Boolean)
                                : [];
                            
                            return {
                                ...track,
                                genreNames: genreNames.length > 0 ? genreNames : ['Unknown Genre']
                            };
                        });
                        tracksByMusicianMap[musician.name] = musicianTracks;
                    }
                });
                
                setTracksByMusician(tracksByMusicianMap);
                console.log('Tracks by musician with genres:', tracksByMusicianMap);
            }
        } catch (error) {
            console.error('Error loading tracks for musicians:', error);
        }
    };

    // Helper function to get image URL
    const getImageUrl = (img?: string | null) => {
        if (!img) return '/vercel.svg';
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        if (img.length === 24) return imageAPI.getImage(img);
        return img;
    };

    // Helper function to generate initials from name
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

    // Handle track play/pause
    const handlePlayPause = (track: any) => {
        try {
            if (!track.trackFile) {
                alert('No track file available for preview');
                return;
            }

            if (currentPlayingTrack === track.id) {
                if (isPlaying) {
                    audioElement?.pause();
                    setIsPlaying(false);
                } else {
                    audioElement?.play();
                    setIsPlaying(true);
                }
                return;
            }

            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }

            const newAudio = new Audio(track.trackFile);
            newAudio.preload = 'metadata';
            
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

            setCurrentPlayingTrack(track.id);
            setAudioElement(newAudio);
            newAudio.play();
            setIsPlaying(true);
            
        } catch (error) {
            console.error('Play error:', error);
            alert('Failed to play track');
        }
    };

    // Handle track download
    const handleDownload = async (track: any) => {
        try {
            if (!track.trackFile) {
                alert('No track file available for download');
                return;
            }

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

    // Update cards per page based on screen size
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && window.innerWidth < 1024) {
                setCardsPerPage(3);
            } else {
                setCardsPerPage(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter musicians by search query
    const filteredMusicians = musicians.filter((musician) => {
        if (searchQuery.trim()) {
            const musicianName = musician.name?.toLowerCase() || '';
            const searchLower = searchQuery.toLowerCase();
            return musicianName.includes(searchLower);
        }
        return true;
    });
    
    // Get tracks for the current musician
    const getCurrentMusicianTracks = (musicianName: string) => {
        return tracksByMusician[musicianName] || [];
    };

    const nextPage = (musicianName: string) => {
        const musicianTracks = getCurrentMusicianTracks(musicianName);
        const totalMusicianPages = Math.ceil(musicianTracks.length / cardsPerPage);
        const currentMusicianPage = musicianPages[musicianName] || 0;
        
        if (currentMusicianPage < totalMusicianPages - 1) {
            setMusicianPages(prev => ({
                ...prev,
                [musicianName]: currentMusicianPage + 1
            }));
        }
    };

    const prevPage = (musicianName: string) => {
        const currentMusicianPage = musicianPages[musicianName] || 0;
        
        if (currentMusicianPage > 0) {
            setMusicianPages(prev => ({
                ...prev,
                [musicianName]: currentMusicianPage - 1
            }));
        }
    };

    const getMusicianPage = (musicianName: string) => {
        return musicianPages[musicianName] || 0;
    };

    const getTotalMusicianPages = (musicianName: string) => {
        const musicianTracks = getCurrentMusicianTracks(musicianName);
        return Math.ceil(musicianTracks.length / cardsPerPage);
    };

    // Loading state
    if (musiciansLoading) {
        return (
            <div className="relative overflow-hidden">
                <Navbar />
                <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="ml-2 text-white">Loading musicians...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden">
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
                <div className='flex flex-col w-full'>
                    <div className='flex flex-col md:flex-row items-center md:items-start justify-between w-full mb-2'>
                        <div className='text-title text-white font-bold text-[26px] md:text-[40px] lg:text-[30px] xl:text-[40px] 2xl:text-[40px] font-bold mb-6 md:mb-0'>
                            Musicians
                        </div>

                        <div className='w-full max-w-md md:max-w-sm lg:max-w-md'>
                            <div className='bg-black/40 backdrop-blur-sm rounded-full border border-white/50'>
                                <div className="flex items-center justify-between py-1 px-2">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Search for musicians..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 font-roboto font-light-300 min-w-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white/50 w-full h-0.5'></div>

                    {searchQuery && (
                        <div className="mt-4 mb-6 text-center">
                            <p className="text-white text-sm">
                                Found <span className="text-primary font-bold">{filteredMusicians.length}</span> musician{filteredMusicians.length !== 1 ? 's' : ''} matching "<span className="text-primary font-bold">{searchQuery}</span>"
                            </p>
                        </div>
                    )}

                    {filteredMusicians.length === 0 && !musiciansLoading && (
                        <div className="mt-8 text-center">
                            <p className="text-white text-lg">
                                {searchQuery ? `No musicians found matching "${searchQuery}"` : 'No musicians found'}
                            </p>
                            <p className="text-white/60 text-sm mt-2">
                                {searchQuery ? 'Try adjusting your search terms' : 'Musicians will appear here once tracks are added'}
                            </p>
                        </div>
                    )}

                    {filteredMusicians.map((musician: any, index: number) => (
                        <div key={`musician-${index}`} className={`${index > 0 ? 'mt-16' : 'mt-8'}`}>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-10 justify-center items-center'>

                                <div className='col-span-1 flex justify-center md:justify-start mt-10 md:mt-0'>
                                    <div className='text-center md:text-left'>
                                        <div className='relative group'>
                                            <div className='w-30 h-30 rounded-full mx-auto md:mx-0 flex items-center justify-center relative overflow-hidden'>
                                                {musician.profilePicture ? (
                                                    <div className="relative w-full h-full">
                                                        <img 
                                                            src={getImageUrl(musician.profilePicture)} 
                                                            alt={musician.name || 'Musician'} 
                                                            className='w-full h-full rounded-full object-cover transition-all duration-300 group-hover:scale-110'
                                                            onError={(e) => { 
                                                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                                                                const parent = (e.currentTarget as HTMLImageElement).parentElement;
                                                                if (parent) {
                                                                    const existingInitials = parent.querySelector('.fallback-initials');
                                                                    if (!existingInitials) {
                                                                        const initialsDiv = document.createElement('div');
                                                                        initialsDiv.className = 'fallback-initials w-full h-full rounded-full bg-gradient-to-br from-[#E100FF] via-[#c800d6] to-[#7ED7FF] flex items-center justify-center text-white font-bold text-2xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl shadow-lg shadow-[#E100FF]/30 hover:shadow-xl hover:shadow-[#E100FF]/50 hover:scale-105 transition-all duration-300';
                                                                        initialsDiv.textContent = getInitials(musician.name);
                                                                        parent.appendChild(initialsDiv);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                ) : (
                                                    <div className='w-full h-full rounded-full flex items-center justify-center relative'>
                                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E100FF] via-[#c800d6] to-[#7ED7FF]"></div>
                                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-[#E100FF] to-[#7ED7FF] p-1 animate-spin-slow">
                                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1a2332] to-[#2a3342] flex items-center justify-center">
                                                                {getInitials(musician.name)}
                                                            </div>
                                                        </div>
                                                        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
                                                        <span className="relative z-10 text-white drop-shadow-lg font-bold text-2xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl">
                                                            {getInitials(musician.name)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className='items-center justify-center mt-4'>
                                            <div className='text-white font-bold text-[20px] md:text-[16px] lg:text-[20px] xl:text-[20px] 2xl:text-[30px] font-bold'>
                                                {musician.name || 'Unknown Musician'}
                                            </div>

                                            <div className='text-white/60 text-[16px] md:text-[12px] lg:text-[16px] xl:text-[16px] leading-5 2xl:text-[20px] font-bold'>
                                                {musician.trackCount || 0} tracks
                                            </div>

                                            <div className='text-white/60 text-[16px] md:text-[10px] lg:text-[12px] xl:text-[14px] 2xl:text-[14px] mt-4'>
                                                {musician.firstTrack?.about || 'No description available'}
                                            </div>
                                            
                                            <button
                                                onClick={() => {
                                                    const musicianName = musician.name || 'Unknown';
                                                    console.log('Navigating to musician profile:', musicianName);
                                                    window.location.href = `/user/pages/Musicians/${encodeURIComponent(musicianName)}`;
                                                }}
                                                className='bg-blue-500 w-full mt-4 text-white px-2 py-2 md:px-4 md:py-2 xl:px-6 xl:py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 font-bold text-sm'
                                            >
                                                Show Profile
                                            </button>
                                            <div className='bg-white/50 w-full h-0.5 mt-4 mb-4 md:hidden'></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-span-2 hidden md:block'>
                                    <div className='w-full h-[300px] lg:h-[320px] xl:h-[380px] relative'>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 overflow-x-auto scrollbar-hide mt-9 items-stretch">
                                            {getCurrentMusicianTracks(musician.name)
                                                .slice(getMusicianPage(musician.name) * cardsPerPage, (getMusicianPage(musician.name) + 1) * cardsPerPage)
                                                .map((track: any) => (
                                                <div key={track._id || track.id} className='flex-shrink-0 h-full'>
                                                    <div className="flex flex-col h-full">
                                                        <div className="w-full aspect-square overflow-hidden rounded-sm bg-black/20 relative group">
                                                            <img 
                                                                src={getImageUrl(track.trackImage)} 
                                                                className="w-full h-full object-cover hover:brightness-125 hover:shadow-lg hover:shadow-white/20 transition-all duration-200 cursor-pointer" 
                                                                alt={track.trackName || 'Track'} 
                                                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vercel.svg'; }}
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <button
                                                                    onClick={() => handlePlayPause(track)}
                                                                    className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                                                                    title={currentPlayingTrack === track.id && isPlaying ? 'Pause' : 'Play'}
                                                                >
                                                                    {currentPlayingTrack === track.id && isPlaying ? (
                                                                        <FaPause className="w-3 h-3" />
                                                                    ) : (
                                                                        <FaPlay className="w-3 h-3 ml-0.5" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex-1 flex flex-col justify-between mt-2 min-h-[80px]">
                                                            <div>
                                                                <h1 className="text-white text-md font-roboto font-bold md:text-sm lg:text-sm xl:text-sm 2xl:text-sm line-clamp-2">
                                                                    {track.trackName || 'Unknown Track'}
                                                                </h1>
                                                                <h1 className="text-white text-sm font-roboto line-clamp-1">
                                                                    {track.musician || 'Unknown Musician'}
                                                                </h1>
                                                                {/* FIX: Display resolved genre names */}
                                                                <p className="text-white/60 text-xs mt-1">
                                                                    {track.genreNames && track.genreNames.length > 0 
                                                                        ? track.genreNames.join(', ')
                                                                        : 'Unknown Genre'}
                                                                </p>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-8 gap-2 mt-auto">
                                                                <button className="grid col-span-6 bg-white/20 backdrop-blur-sm rounded-full font-bold text-white justify-center items-center rounded-sm hover:bg-white/30 transition-colors duration-200 text-xs py-2">
                                                                    $ {track.trackPrice || 0}
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDownload(track)}
                                                                    className="grid col-span-2 bg-primary text-black px-2 py-2 md:px-2 md:py-2 xl:px-4 xl:py-1 rounded-sm hover:bg-primary/70 transition-colors duration-200"
                                                                >
                                                                    <img src={Downloadicon.src} alt="Download" className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                                            <button
                                                onClick={() => prevPage(musician.name)}
                                                disabled={getMusicianPage(musician.name) === 0}
                                                className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                                            >
                                                <RiArrowLeftSLine className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => nextPage(musician.name)}
                                                disabled={getMusicianPage(musician.name) === getTotalMusicianPages(musician.name) - 1}
                                                className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-4"
                                            >
                                                <RiArrowRightSLine className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                            <div className="flex space-x-2">
                                                {Array.from({ length: getTotalMusicianPages(musician.name) }, (_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setMusicianPages(prev => ({ ...prev, [musician.name]: index }))}
                                                        className={`w-2 h-2 rounded-full transition-colors ${getMusicianPage(musician.name) === index ? 'bg-white' : 'bg-white/50'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            </div>

            <Footer />
        </div>
    )
}

export default page