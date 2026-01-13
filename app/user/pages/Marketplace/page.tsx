'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  FaSearch, 
  FaFilter, 
  FaPlay, 
  FaPause, 
  FaShoppingCart, 
  FaHeart,
  FaMusic,
  FaSortAmountDown,
  FaTimes
} from 'react-icons/fa'
import { genreAPI } from '../../../utils/api'

interface Track {
  id: string;
  trackName: string;
  trackImage: string;
  trackFile: string;
  trackPrice: number;
  musician: string;
  musicianProfilePicture: string;
  bpm: number;
  trackKey: string;
  moodType: string;
  genreCategory: string[];
  salesCount: number;
  playCount: number;
}

export default function Marketplace() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<any[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTracks, setTotalTracks] = useState(0);
  
  // Audio player
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // User state
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchGenres();
    fetchTracks();
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [currentPage, sortBy, selectedGenre]);

  const fetchGenres = async () => {
    try {
      const response = await genreAPI.getGenres();
      if (response.success) {
        setGenres(response.genres);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGenre) params.append('genre', selectedGenre);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);

      const response = await fetch(`http://localhost:3001/api/marketplace?${params}`);
      const data = await response.json();

      if (data.success) {
        setTracks(data.tracks);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTracks(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // Fallback to regular tracks endpoint
      try {
        const response = await fetch('http://localhost:3001/api/tracks');
        const data = await response.json();
        if (data.success) {
          const publicTracks = data.tracks.filter((t: any) => t.publish === 'Public');
          setTracks(publicTracks);
          setTotalTracks(publicTracks.length);
        }
      } catch (e) {
        console.error('Fallback error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTracks();
  };

  const handlePlayPause = (track: Track) => {
    if (currentPlayingId === track.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.trackFile;
        audioRef.current.play();
        setCurrentPlayingId(track.id);
        setIsPlaying(true);
        
        // Track play count
        fetch(`http://localhost:3001/api/tracks/${track.id}/play`, { method: 'POST' }).catch(() => {});
      }
    }
  };

  const handleAddToCart = async (track: Track) => {
    if (!user) {
      router.push('/user/pages/SignIn');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          trackId: track.id,
          licenseType: 'personal'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCartCount(prev => prev + 1);
        alert('Added to cart!');
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart');
    }
  };

  const handleTrackClick = (trackId: string) => {
    router.push(`/user/pages/Track/${trackId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setCurrentPage(1);
  };

  const TrackCard = ({ track }: { track: Track }) => (
    <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl overflow-hidden border border-[#232B43] hover:border-[#E100FF]/50 transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => handleTrackClick(track.id)}>
        <img 
          src={track.trackImage || '/default-track.jpg'} 
          alt={track.trackName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); handlePlayPause(track); }}
            className="w-14 h-14 rounded-full bg-[#E100FF] flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            {currentPlayingId === track.id && isPlaying ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
          </button>
        </div>
        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white font-bold">${track.trackPrice}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 
          className="text-white font-semibold text-lg mb-1 truncate cursor-pointer hover:text-[#E100FF] transition-colors"
          onClick={() => handleTrackClick(track.id)}
        >
          {track.trackName}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          {track.musicianProfilePicture && (
            <img src={track.musicianProfilePicture} alt="" className="w-6 h-6 rounded-full object-cover" />
          )}
          <span className="text-gray-400 text-sm truncate">{track.musician}</span>
        </div>

        {/* Track Info */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          {track.bpm && <span>{track.bpm} BPM</span>}
          {track.trackKey && <span>{track.trackKey}</span>}
          {track.moodType && <span>{track.moodType}</span>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddToCart(track)}
            className="flex-1 bg-[#E100FF] hover:bg-[#E100FF]/80 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <FaShoppingCart size={14} />
            Add to Cart
          </button>
          <button className="p-2 bg-[#232B43] hover:bg-[#232B43]/80 text-white rounded-lg transition-colors">
            <FaHeart size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#081028]">
      <Navbar />
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">Discover and purchase unique tracks from talented creators</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search tracks, artists..."
                className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg pl-12 pr-4 py-3 text-white focus:border-[#E100FF] focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-3 text-white focus:border-[#E100FF] focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${showFilters ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-gray-300 hover:bg-[#232B43]/80'}`}
            >
              <FaFilter />
              Filters
            </button>

            <button
              onClick={handleSearch}
              className="bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-[#232B43]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Genre */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-2 text-white focus:border-[#E100FF] focus:outline-none"
                  >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Min Price</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    placeholder="$0"
                    className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-2 text-white focus:border-[#E100FF] focus:outline-none"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Max Price</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    placeholder="$1000"
                    className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-2 text-white focus:border-[#E100FF] focus:outline-none"
                  />
                </div>

                {/* Clear */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 transition-colors"
                  >
                    <FaTimes />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white">{tracks.length}</span> of <span className="text-white">{totalTracks}</span> tracks
          </p>
        </div>

        {/* Tracks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E100FF]"></div>
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FaMusic className="text-gray-600 text-5xl mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">No Tracks Found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#232B43] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232B43]/80 transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page ? 'bg-[#E100FF] text-white' : 'bg-[#232B43] text-white hover:bg-[#232B43]/80'}`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#232B43] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232B43]/80 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}