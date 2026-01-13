'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  FaDownload, 
  FaPlay, 
  FaPause, 
  FaMusic,
  FaFileAlt,
  FaCalendar,
  FaKey,
  FaCopy,
  FaCheck
} from 'react-icons/fa'

interface LibraryItem {
  id: string;
  trackId: string;
  licenseType: string;
  licenseKey: string;
  downloadCount: number;
  purchasedAt: string;
  tracks: {
    id: string;
    trackName: string;
    trackImage: string;
    trackFile: string;
    musician: string;
    musicianProfilePicture: string;
    bpm: number;
    trackKey: string;
  };
  orders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
  };
}

export default function MyLibrary() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchLibrary(parsedUser.id);
  }, [router]);

  const fetchLibrary = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/library/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setLibrary(data.library);
      }
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (item: LibraryItem) => {
    if (!audioRef.current) return;

    if (currentPlayingId === item.id && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = item.tracks.trackFile;
      audioRef.current.play();
      setCurrentPlayingId(item.id);
      setIsPlaying(true);
    }
  };

  const handleDownload = async (item: LibraryItem) => {
    try {
      const response = await fetch(`http://localhost:3001/api/library/download/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || `${item.tracks.trackName}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Update download count locally
        setLibrary(prev => prev.map(lib => 
          lib.id === item.id 
            ? { ...lib, downloadCount: lib.downloadCount + 1 }
            : lib
        ));
      } else {
        alert(data.message || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: direct download
      window.open(item.tracks.trackFile, '_blank');
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getLicenseColor = (type: string) => {
    switch (type) {
      case 'exclusive': return 'bg-[#E100FF]/20 text-[#E100FF]';
      case 'commercial': return 'bg-[#7ED7FF]/20 text-[#7ED7FF]';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081028]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E100FF]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081028]">
      <Navbar />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Library</h1>
          <p className="text-gray-400">Your purchased tracks and licenses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Tracks</p>
            <p className="text-2xl font-bold text-white">{library.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Downloads</p>
            <p className="text-2xl font-bold text-white">
              {library.reduce((sum, item) => sum + item.downloadCount, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-white">
              ${library.reduce((sum, item) => sum + (item.orders?.totalAmount || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Library List */}
        {library.length > 0 ? (
          <div className="space-y-4">
            {library.map(item => (
              <div 
                key={item.id}
                className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl border border-[#232B43] overflow-hidden hover:border-[#E100FF]/50 transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Track Image */}
                  <div className="md:w-40 aspect-square md:aspect-auto relative flex-shrink-0">
                    <img 
                      src={item.tracks?.trackImage || '/default-track.jpg'} 
                      alt={item.tracks?.trackName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handlePlayPause(item)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#E100FF] flex items-center justify-center">
                        {currentPlayingId === item.id && isPlaying 
                          ? <FaPause size={16} /> 
                          : <FaPlay size={16} className="ml-0.5" />
                        }
                      </div>
                    </button>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">
                          {item.tracks?.trackName}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          {item.tracks?.musicianProfilePicture && (
                            <img 
                              src={item.tracks.musicianProfilePicture} 
                              alt="" 
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-400 text-sm">{item.tracks?.musician}</span>
                        </div>

                        {/* Track Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                          {item.tracks?.bpm && <span>{item.tracks.bpm} BPM</span>}
                          {item.tracks?.trackKey && <span>{item.tracks.trackKey}</span>}
                          <span className="flex items-center gap-1">
                            <FaCalendar className="text-xs" />
                            {formatDate(item.purchasedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaDownload className="text-xs" />
                            {item.downloadCount} downloads
                          </span>
                        </div>

                        {/* License Info */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLicenseColor(item.licenseType)}`}>
                            {item.licenseType.charAt(0).toUpperCase() + item.licenseType.slice(1)} License
                          </span>
                          
                          {/* License Key */}
                          <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1.5">
                            <FaKey className="text-gray-500 text-xs" />
                            <code className="text-gray-400 text-xs">{item.licenseKey}</code>
                            <button
                              onClick={() => copyLicenseKey(item.licenseKey)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {copiedKey === item.licenseKey ? (
                                <FaCheck className="text-green-400 text-xs" />
                              ) : (
                                <FaCopy className="text-xs" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row md:flex-col gap-2">
                        <button
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-2 bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaDownload />
                          Download
                        </button>
                        <button
                          onClick={() => router.push(`/user/pages/Track/${item.trackId}`)}
                          className="flex items-center gap-2 bg-[#232B43] hover:bg-[#232B43]/80 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <FaFileAlt />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl border border-[#232B43]">
            <FaMusic className="text-gray-600 text-5xl mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No Tracks Yet</h3>
            <p className="text-gray-400 mb-6">Start building your library by purchasing tracks from the marketplace</p>
            <button
              onClick={() => router.push('/user/pages/Marketplace')}
              className="bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}