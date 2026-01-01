'use client'
import { IoMdArrowDropdown } from "react-icons/io";
import Navbar from '../../components/Navbar'
import Musicdata from '../musicdata.json'
import Dropdown from '../../dropdown.json'
import Filters from '../../filters.json'
import React, { useEffect, useState, Suspense } from 'react'
import Downloadicon from '../../images/icon/Download.svg'
import Image from '../../images/songimage/song.png'
import First_carousel from '../../components/First_carousel'
import Footer from '../../components/Footer'
import { trackAPI, imageAPI, genreAPI, tagAPI, downloadAPI } from '../../../utils/api'
import { FaPlay, FaPause } from 'react-icons/fa'

function TopChartsContent() {
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Data state
  const [data, setData] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [screenSize, setScreenSize] = useState('mobile');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Tag filtering state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Audio player state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Search state for track_tags
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dropdown filter states
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTrackType, setSelectedTrackType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedBPM, setSelectedBPM] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  
  // Price range state
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 });
  const [showPriceRange, setShowPriceRange] = useState(false);
  
  // Calculate price range from data
  const allPrices = data.map(track => parseFloat(track.trackPrice) || 0).filter(price => price > 0);
  const minPrice = allPrices.length > 0 ? Math.floor(Math.min(...allPrices)) : 0;
  const maxPrice = allPrices.length > 0 ? Math.ceil(Math.max(...allPrices)) : 100;
  
  // Update price range when data changes
  useEffect(() => {
    if (allPrices.length > 0) {
      setPriceRange({ min: minPrice, max: maxPrice });
    }
  }, [data, minPrice, maxPrice]);
  
  // Reset to first page when price range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange]);
  
  // Carousel filter state
  const [carouselFilter, setCarouselFilter] = useState<string | null>(null);
  const [carouselFilteredData, setCarouselFilteredData] = useState<any[]>([]);

  // Determine cards per page based on screen size
  const getCardsPerPage = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 10; // mobile
      if (width < 768) return 12; // sm
      if (width < 1024) return 8;  // md
      return 10; // lg and above
    }
    return 10; // default
  };

  const cardsPerPage = getCardsPerPage();

  // Helper function to get proper image URL
  const getImageUrl = (trackImage: string | null | undefined) => {
    if (!trackImage) return "/vercel.svg";
    
    // If it's already a full URL, return it
    if (trackImage.startsWith('http://') || trackImage.startsWith('https://')) {
      return trackImage;
    }
    
    // If it's a GridFS file ID, construct the URL
    if (trackImage.length === 24) { // MongoDB ObjectId length
      return imageAPI.getImage(trackImage);
    }
    
    // If it's a relative path or other format, return as is
    return trackImage;
  };

  // Helper function to get genre name by ID
  const getGenreName = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    return genre ? genre.name : genreId;
  };

  // Helper function to get genre ID by name
  const getGenreId = (genreName: string) => {
    const genre = genres.find(g => g.name === genreName);
    return genre ? genre.id : genreName;
  };

  // Helper function to get tag name by ID
  const getTagName = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    return tag ? tag.name : tagId;
  };

  // Helper function to get tag ID by name
  const getTagId = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.id : tagName;
  };

  // Initialize search query from sessionStorage (from home page search)
  useEffect(() => {
    const homeSearchQuery = sessionStorage.getItem('homeSearchQuery');
    if (homeSearchQuery) {
      setSearchQuery(homeSearchQuery);
      
      // Try to find and select a matching tag if the search query matches a tag name
      if (tags.length > 0) {
        const matchingTag = tags.find(tag => 
          tag.name.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
          homeSearchQuery.toLowerCase().includes(tag.name.toLowerCase())
        );
        if (matchingTag) {
          setSelectedTag(matchingTag.name);
        }
      }
      
      // Clear the sessionStorage after using it
      sessionStorage.removeItem('homeSearchQuery');
    }
  }, [tags]);

  // Handle tag selection when tags are loaded and we have a search query
  useEffect(() => {
    if (searchQuery && tags.length > 0 && !selectedTag) {
      const matchingTag = tags.find(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes(tag.name.toLowerCase())
      );
      if (matchingTag) {
        setSelectedTag(matchingTag.name);
      }
    }
  }, [tags, searchQuery, selectedTag]);

  // Load tracks, genres, and tags from MongoDB
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load tracks
        const tracksResponse = await trackAPI.getTracks();
        if (tracksResponse.success) {
          setData(tracksResponse.tracks);
        }
        
        // Load genres
        const genresResponse = await genreAPI.getGenres();
        if (genresResponse.success) {
          setGenres(genresResponse.genres);
        }
        
        // Load tags
        const tagsResponse = await tagAPI.getTags();
        if (tagsResponse.success) {
          setTags(tagsResponse.tags);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  // Filter data based on selected tag, dropdown filters, and carousel filter
  const filteredData = data.filter(track => {
    // Carousel filter (highest priority)
    if (carouselFilter && carouselFilteredData.length > 0) {
      const isInCarouselFilter = carouselFilteredData.some(filteredTrack => filteredTrack.id === track.id);
      if (!isInCarouselFilter) return false;
    }
    
    // Tag filtering (if selectedTag is set or searchQuery is provided)
    if (selectedTag || searchQuery.trim()) {
      const trackTags = Array.isArray(track.trackTags) 
        ? track.trackTags 
        : typeof track.trackTags === 'string' 
          ? track.trackTags.split(',').map((tag: string) => tag.trim())
          : [];
      
      // Convert tag IDs to tag names for comparison
      const trackTagNames = trackTags.map((tagId: string) => getTagName(tagId));
      
      // Check if any tag matches the selected tag or search query
      const hasMatchingTag = trackTagNames.some((tagName: string) => {
        if (selectedTag) {
          return tagName.toLowerCase() === selectedTag.toLowerCase();
        }
        if (searchQuery.trim()) {
          // Use exact matching for search query to show only songs with that exact tag
          return tagName.toLowerCase() === searchQuery.toLowerCase();
        }
        return false;
      });
      
      if (!hasMatchingTag) return false;
    }
    
    // Dropdown filters
    if (selectedGenre) {
      const trackGenres = Array.isArray(track.genreCategory) 
        ? track.genreCategory 
        : typeof track.genreCategory === 'string' 
          ? track.genreCategory.split(',').map((id: string) => id.trim())
          : [];
      
      const selectedGenreId = getGenreId(selectedGenre);
      const hasSelectedGenre = trackGenres.some((genreId: string) => genreId === selectedGenreId);
      if (!hasSelectedGenre) return false;
    }
    if (selectedTrackType && track.trackType !== selectedTrackType) return false;
    // Price range filtering - only apply if user has set a custom range
    if (priceRange.min > minPrice || priceRange.max < maxPrice) {
      const trackPrice = parseFloat(track.trackPrice) || 0;
      if (trackPrice < priceRange.min || trackPrice > priceRange.max) return false;
    }
    if (selectedMood && track.moodType !== selectedMood) return false;
    if (selectedBPM && track.bpm !== selectedBPM) return false;
    if (selectedInstrument && track.instrument !== selectedInstrument) return false;
    if (selectedKey && track.trackKey !== selectedKey) return false;
    
    return true;
  });

  // Pagination logic
  const totalCards = filteredData.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = filteredData.slice(startIndex, endIndex);

  // Log filtering summary
  if (selectedTag || searchQuery.trim()) {
    console.log(`=== FILTERING SUMMARY ===`);
    if (selectedTag) console.log(`Selected Tag: "${selectedTag}"`);
    if (searchQuery.trim()) console.log(`Search Query: "${searchQuery}"`);
    console.log(`Total tracks in data: ${data.length}`);
    console.log(`Filtered tracks: ${filteredData.length}`);
    console.log(`Tracks being displayed: ${currentCards.length}`);
    console.log(`Current page: ${currentPage} of ${totalPages}`);
    console.log(`=======================`);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag, 'Previous selected:', selectedTag);
    
    // Add refresh effect
    setIsRefreshing(true);
    
    setTimeout(() => {
      if (selectedTag === tag) {
        // If clicking the same tag, deselect it
        setSelectedTag(null);
        console.log('Deselecting tag, showing all data');
      } else {
        // Always select the new tag (deselect previous one)
        setSelectedTag(tag);
        // Clear search query when tag is selected
        setSearchQuery('');
        console.log('Selecting new tag:', tag, 'Previous tag deselected, search cleared');
      }
      // Reset to first page when filtering
      setCurrentPage(1);
      setIsRefreshing(false);
    }, 300); // 300ms refresh delay
  };

  // Handle search input for track_tags
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Clear selected tag when user types in search bar
    if (query.trim()) {
      setSelectedTag(null);
    }
    setCurrentPage(1); // Reset to first page when searching
    console.log('Searching for exact tag:', query);
  };

  // Handle track download
  const handleDownload = async (track: any) => {
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

  // Handle track play/pause
  const handlePlayPause = (track: any) => {
    try {
      if (!track.trackFile) {
        alert('No track file available for preview');
        return;
      }

      // If clicking the same track that's currently playing, toggle play/pause
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
      setCurrentPlayingTrack(track.id);
      setAudioElement(newAudio);
      newAudio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Play error:', error);
      alert('Failed to play track');
    }
  };

  // Handle dropdown option selection
  const handleDropdownOption = (category: string, value: string) => {
    console.log('Dropdown option selected:', category, value);
    
    // Update the appropriate state based on category
    switch (category) {
      case 'Genre':
        setSelectedGenre(selectedGenre === value ? null : value);
        break;
      case 'Track Type':
        setSelectedTrackType(selectedTrackType === value ? null : value);
        break;
      case 'Price':
        // Price is now handled by range selector, not dropdown
        break;
      case 'Mood':
        setSelectedMood(selectedMood === value ? null : value);
        break;
      case 'BPM':
        setSelectedBPM(selectedBPM === value ? null : value);
        break;
      case 'Instruments':
        setSelectedInstrument(selectedInstrument === value ? null : value);
        break;
      case 'Key':
        setSelectedKey(selectedKey === value ? null : value);
        break;
    }
    
    setCurrentPage(1); // Reset to first page when filtering
    setOpenDropdown(null); // Close dropdown
  };

  // Clear carousel filter
  const clearCarouselFilter = () => {
    setCarouselFilter(null);
    setCarouselFilteredData([]);
    sessionStorage.removeItem('selectedFilter');
    sessionStorage.removeItem('filteredMusicData');
    console.log('Carousel filter cleared');
  };

  // Handle window resize to update pagination
  useEffect(() => {
    const handleResize = () => {
      const newCardsPerPage = getCardsPerPage();
      const newTotalPages = Math.ceil(totalCards / newCardsPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages || 1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalCards, currentPage]);

  // Listen for carousel filter changes from session storage
  useEffect(() => {
    const checkCarouselFilter = () => {
      const storedFilter = sessionStorage.getItem('selectedFilter');
      const storedData = sessionStorage.getItem('filteredMusicData');
      
      if (storedFilter && storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setCarouselFilter(storedFilter);
          setCarouselFilteredData(parsedData);
          console.log(`Carousel filter applied: ${storedFilter} with ${parsedData.length} tracks`);
        } catch (error) {
          console.error('Error parsing carousel filter data:', error);
        }
      } else {
        // Clear carousel filter if no data in session storage
        setCarouselFilter(null);
        setCarouselFilteredData([]);
      }
    };

    // Check immediately
    checkCarouselFilter();

    // Listen for storage events (when First_carousel updates session storage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedFilter' || e.key === 'filteredMusicData') {
        checkCarouselFilter();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (for same-tab updates)
    const interval = setInterval(checkCarouselFilter, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Handle dropdown toggle
  const toggleDropdown = (dropdownId: number, event: React.MouseEvent) => {
    if (openDropdown === dropdownId) {
      setOpenDropdown(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      
      let leftPosition = rect.left;
      
      // On mobile, adjust position for last dropdowns to prevent overflow
      if (isMobile) {
        const dropdownWidth = 224; // min-w-56 = 224px
        const screenWidth = window.innerWidth;
        const margin = 16; // 16px margin
        
        // If dropdown would overflow right edge, adjust left position
        if (rect.left + dropdownWidth + margin > screenWidth) {
          leftPosition = screenWidth - dropdownWidth - margin;
        }
        
        // Ensure it doesn't go too far left
        leftPosition = Math.max(margin, leftPosition);
      }
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: leftPosition
      });
      setOpenDropdown(dropdownId);
    }
  };



  // Close dropdown when clicking outside and update position on scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    const handleScroll = () => {
      if (openDropdown !== null) {
        // Find the button element and recalculate position
        const button = document.querySelector(`[data-dropdown-id="${openDropdown}"]`);
        if (button) {
          const rect = button.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;
          
          let leftPosition = rect.left;
          
          // On mobile, adjust position for last dropdowns to prevent overflow
          if (isMobile) {
            const dropdownWidth = 224; // min-w-56 = 224px
            const screenWidth = window.innerWidth;
            const margin = 16; // 16px margin
            
            // If dropdown would overflow right edge, adjust left position
            if (rect.left + dropdownWidth + margin > screenWidth) {
              leftPosition = screenWidth - dropdownWidth - margin;
            }
            
            // Ensure it doesn't go too far left
            leftPosition = Math.max(margin, leftPosition);
          }
          
          setDropdownPosition({
            top: rect.bottom + 8,
            left: leftPosition
          });
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [openDropdown]);

  return (
    <div>
      <div className="relative z-1000">
      <Navbar />
      </div>
      <div className="containerpaddin   container mx-auto  pt-34 sm:pt-28 md:pt-32 lg:pt-36 ">
        <h1 className="text-white text-4xl font-roboto font-bold mb-4">Top Charts</h1>
        <First_carousel />
        <div className='md:flex items-center  overflow-hidden'>
          <div className='bg-black/40 backdrop-blur-sm rounded-full border border-white/50 '>
            <div className="flex items-center justify-between py-1 px-2">
              <div className="flex items-center flex-1 min-w-0">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter exact tag name..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 font-roboto font-light-300 min-w-0"
                />
              </div>
            </div>
          </div>

          <div className='px-2 '>
            <div className='h-4  md:h-4 lg:h-6 w-px bg-white/50 hidden md:block' />
          </div>

          <div
            className='flex items-center gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing py-2'
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {!loading && tags.length > 0 ? (
              // Collect all unique tags from all tracks and filter by search query
              (() => {
                const allTags = new Set<string>();
                
                data.forEach(track => {
                  const trackTags = Array.isArray(track.trackTags) 
                    ? track.trackTags 
                    : typeof track.trackTags === 'string' 
                      ? track.trackTags.split(',').map((tag: string) => tag.trim())
                      : [];
                  
                  trackTags.forEach((tagId: string) => {
                    const tagName = getTagName(tagId);
                    // Only add if it's a human-readable name (not a UUID)
                    if (tagName !== tagId) {
                      allTags.add(tagName);
                    }
                  });
                });
                
                // Filter tags based on search query - show exact matches only
                const filteredTags = searchQuery.trim() 
                  ? Array.from(allTags).filter(tag => 
                      tag.toLowerCase() === searchQuery.toLowerCase()
                    )
                  : Array.from(allTags);
                
                return filteredTags.map((tag: string, index: number) => (
                  <div key={`tag-${index}`} className='flex-shrink-0'>
                    <div 
                      className={`backdrop-blur-sm rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        selectedTag === tag 
                          ? 'bg-white/60 border-white/80 text-black' 
                          : 'bg-black/40 border-white/50 text-white hover:bg-black/60'
                      }`}
                      onClick={() => handleTagClick(tag)}
                    >
                      <div className="py-1 px-1 flex items-center justify-center w-full">
                        <p className={`font-roboto font-light-300 px-4 ${
                          selectedTag === tag ? 'text-black' : 'text-white'
                        }`}>
                          {tag}
                          {selectedTag === tag && <span className="ml-1">✓</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              // Show loading state for tags
              <div className="flex-shrink-0">
                <div className="backdrop-blur-sm rounded-full border border-white/50 bg-black/40 flex items-center justify-center">
                  <div className="py-1 px-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <p className="font-roboto font-light-300 text-white text-sm">Loading tags...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        <div
          className='flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing py-2 mt-4'

          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >

          <div className="flex items-center justify-center gap-4">
            {/* Dynamic dropdown buttons mapped from data.json */}
            {(() => {
              // Extract unique values from MongoDB data for each category
              const allGenreIds = new Set<string>();
              
              // Collect all genre IDs from all tracks
              data.forEach(track => {
                const trackGenres = Array.isArray(track.genreCategory) 
                  ? track.genreCategory 
                  : typeof track.genreCategory === 'string' 
                    ? track.genreCategory.split(',').map((id: string) => id.trim())
                    : [];
                
                trackGenres.forEach((genreId: string) => allGenreIds.add(genreId));
              });
              
              const genreNames = Array.from(allGenreIds).map(id => getGenreName(id));
              const trackTypes = [...new Set(data.map(track => track.trackType).filter(Boolean))];

              const moods = [...new Set(data.map(track => track.moodType).filter(Boolean))];
              const bpms = [...new Set(data.map(track => track.bpm).filter(Boolean))];
              const instruments = [...new Set(data.map(track => track.instrument).filter(Boolean))];
              const keys = [...new Set(data.map(track => track.trackKey).filter(Boolean))];
              const dropdowns = [
                { id: 1, category: "Genre", options: genreNames },
                { id: 2, category: "Track Type", options: trackTypes },
                { id: 4, category: "Mood", options: moods },
                { id: 5, category: "BPM", options: bpms },
                { id: 6, category: "Instruments", options: instruments },
                { id: 7, category: "Key", options: keys }
              ];

              return dropdowns.map((dropdown) => (
              <div key={dropdown.id} className="relative">
                {/* Dropdown Button */}
                <button
                  className="flex items-center gap-2 text-white hover:text-primary transition-colors duration-200"
                  data-dropdown-id={dropdown.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Clicking dropdown:', dropdown.id, 'Current open:', openDropdown);
                    toggleDropdown(dropdown.id, e);
                  }}
                >
                  <span className="font-roboto font-light-300">{dropdown.category}</span>
                  <IoMdArrowDropdown
                    className={`transition-transform duration-200 ${openDropdown === dropdown.id ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === dropdown.id && (
                  <div className="fixed bg-black/80 scrollbar-hide backdrop-blur-sm border-2 border-white/30 rounded-lg shadow-xl min-w-56 max-h-96 overflow-y-auto mx-4 md:mx-0" style={{ 
                    zIndex: 10, 
                    top: `${dropdownPosition.top}px`, 
                    left: `${dropdownPosition.left}px`,
                    right: window.innerWidth < 768 ? '16px' : 'auto',
                    maxWidth: window.innerWidth < 768 ? 'calc(100vw - 32px)' : 'none',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}>
                    <div className="p-3 border-b border-white/20 bg-black/60 sticky top-0 z-10">
                      <h3 className="text-white font-bold text-sm">{dropdown.category} Options</h3>
                    </div>
                    <div className="py-2 overflow-y-auto scrollbar-hide max-h-80">
                      {/* Dynamic options mapped from data.json */}
                      {dropdown.options.map((item: string, index: number) => (
                        <div
                          key={index}
                          className="px-4 py-3 text-white hover:bg-white/20 cursor-pointer transition-colors duration-150 border-l-2 border-transparent hover:border-white/30"
                          onClick={() => handleDropdownOption(dropdown.category, item)}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                             </div>
             ));
            })()}

            {/* Price Range Selector */}
            <div className="flex items-center gap-4 ml-4">
              <button
                className="flex items-center gap-2 text-white hover:text-primary transition-colors duration-200"
                onClick={() => setShowPriceRange(!showPriceRange)}
              >
                <span className="font-roboto font-light-300">Price Range</span>
                <IoMdArrowDropdown
                  className={`transition-transform duration-200 ${showPriceRange ? "rotate-180" : ""}`}
                />
              </button>
              
              {/* Price Range Display */}
              <div className="text-white text-sm">
                ${priceRange.min} - ${priceRange.max}
              </div>
            </div>

            </div>
          <div className="text-white items-end justify-end">

          </div>
        </div>

        {/* Price Range Slider */}
        {showPriceRange && (
          <div className="mt-4 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Price Range</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPriceRange({ min: minPrice, max: maxPrice })}
                  className="text-primary hover:text-primary/80 text-sm underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowPriceRange(false)}
                  className="text-gray-400 hover:text-white text-sm p-1 hover:bg-white/10 rounded transition-colors"
                  title="Close price range selector"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-white text-sm mb-2">Min Price: ${priceRange.min}</label>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-white text-sm mb-2">Max Price: ${priceRange.max}</label>
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange.min}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPriceRange(prev => ({ 
                        ...prev, 
                        min: Math.min(value, prev.max - 1) 
                      }));
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-center"
                    placeholder="Min"
                  />
                </div>
                <div className="text-white">to</div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange.max}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPriceRange(prev => ({ 
                        ...prev, 
                        max: Math.max(value, prev.min + 1) 
                      }));
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-center"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Debug info */}
        {(carouselFilter || selectedTag || searchQuery || selectedGenre || selectedTrackType || selectedPrice || selectedMood || selectedBPM || selectedInstrument || selectedKey) && (
          <div className="mt-4 mb-4 p-3 bg-black/20 rounded-lg">
            <p className="text-white text-sm">
              {carouselFilter && (
                <span>
                  <strong>Carousel Filter:</strong> <span className="text-blue-400 font-bold">{carouselFilter}</span>
                  <button 
                    onClick={clearCarouselFilter}
                    className="ml-2 text-blue-300 hover:text-white text-xs underline"
                  >
                    Clear
                  </button> | 
                </span>
              )}
              {selectedTag && (
                <span>
                  <strong>Tag:</strong> <span className="text-primary font-bold">{selectedTag}</span>
                  <button 
                    onClick={() => {
                      setSelectedTag(null);
                      setSearchQuery('');
                    }}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {searchQuery && (
                <span>
                  <strong>Search:</strong> <span className="text-primary font-bold">"{searchQuery}"</span>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                    }}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedGenre && (
                <span>
                  <strong>Genre:</strong> <span className="text-primary font-bold">{selectedGenre}</span>
                  <button 
                    onClick={() => setSelectedGenre(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedTrackType && (
                <span>
                  <strong>Type:</strong> <span className="text-primary font-bold">{selectedTrackType}</span>
                  <button 
                    onClick={() => setSelectedTrackType(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {(priceRange.min > minPrice || priceRange.max < maxPrice) && (
                <span>
                  <strong>Price Range:</strong> <span className="text-primary font-bold">${priceRange.min} - ${priceRange.max}</span>
                  <button 
                    onClick={() => setPriceRange({ min: minPrice, max: maxPrice })}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedMood && (
                <span>
                  <strong>Mood:</strong> <span className="text-primary font-bold">{selectedMood}</span>
                  <button 
                    onClick={() => setSelectedMood(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedBPM && (
                <span>
                  <strong>BPM:</strong> <span className="text-primary font-bold">{selectedBPM}</span>
                  <button 
                    onClick={() => setSelectedBPM(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedInstrument && (
                <span>
                  <strong>Instrument:</strong> <span className="text-primary font-bold">{selectedInstrument}</span>
                  <button 
                    onClick={() => setSelectedInstrument(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedKey && (
                <span>
                  <strong>Key:</strong> <span className="text-primary font-bold">{selectedKey}</span>
                  <button 
                    onClick={() => setSelectedKey(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              <strong>Showing:</strong> {filteredData.length} tracks | 
              <strong>Total:</strong> {data.length} tracks
              <button 
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery('');
                  setSelectedGenre(null);
                  setSelectedTrackType(null);
                  setSelectedMood(null);
                  setSelectedBPM(null);
                  setSelectedInstrument(null);
                  setSelectedKey(null);
                  setPriceRange({ min: minPrice, max: maxPrice });
                  clearCarouselFilter();
                  setCurrentPage(1);
                }}
                className="ml-4 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
              >
                Clear All Filters
              </button>
            </p>
            <p className="text-white text-xs mt-1">
              <strong>Active Filters:</strong> {[
                carouselFilter && 'Carousel',
                selectedTag && 'Tag',
                searchQuery && 'Search',
                selectedGenre && 'Genre',
                selectedTrackType && 'Track Type',
                (priceRange.min > minPrice || priceRange.max < maxPrice) && 'Price Range',
                selectedMood && 'Mood',
                selectedBPM && 'BPM',
                selectedInstrument && 'Instrument',
                selectedKey && 'Key',
              ].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {/* Refresh indicator */}
        {isRefreshing && (
          <div className="mt-4 mb-4 p-3 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-white">Refreshing...</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Tracks Grid */}
        {!loading && (
          <>
            {filteredData.length === 0 ? (
              // No results found message
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {searchQuery ? `No tracks found for "${searchQuery}"` : 'No tracks found'}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md">
                  {searchQuery 
                    ? `We couldn't find any tracks matching "${searchQuery}". Try searching for a different tag or browse all tracks.`
                    : 'No tracks match your current filters. Try adjusting your search criteria.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTag(null);
                        setCurrentPage(1);
                      }}
                      className="px-6 py-3 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                      setSelectedGenre(null);
                      setSelectedTrackType(null);
                      setSelectedMood(null);
                      setSelectedBPM(null);
                      setSelectedInstrument(null);
                      setSelectedKey(null);
                      setPriceRange({ min: minPrice, max: maxPrice });
                      clearCarouselFilter();
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                  >
                    Show All Tracks
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-stretch scrollbar-hide mt-9 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                {currentCards.map(track => (
              <div key={track.id} className='h-full'>
                <div className="flex flex-col h-full">
                  <div className="w-full aspect-square sm:aspect-[4/5] md:aspect-square lg:aspect-[4/5] overflow-hidden rounded-sm bg-black/20 relative group">
                    <img 
                      src={getImageUrl(track.trackImage)} 
                      className="w-full h-full object-cover hover:brightness-110 transition-all duration-200 cursor-pointer" 
                      alt={track.trackName}
                      onError={(e) => {
                        e.currentTarget.src = "/vercel.svg";
                      }}
                    />
                    {/* Play/Pause Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handlePlayPause(track)}
                        className="bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                        title={currentPlayingTrack === track.id && isPlaying ? 'Pause' : 'Play'}
                      >
                        {currentPlayingTrack === track.id && isPlaying ? (
                          <FaPause className="w-4 h-4" />
                        ) : (
                          <FaPlay className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h1 className="text-white text-md font-roboto font-bold mt-2 line-clamp-2">{track.trackName}</h1>
                  <h1 className="text-white text-sm font-roboto">{track.musician}</h1>
                  <div className="grid grid-cols-8 gap-2 mt-auto">
                    <button className="grid col-span-6 bg-white/20 backdrop-blur-sm rounded-full font-bold text-white justify-center items-center rounded-sm hover:bg-white/30 transition-colors duration-200">
                      $ {track.trackPrice || 0}
                    </button>
                    <button 
                      onClick={() => handleDownload(track)}
                      className="grid col-span-2 bg-primary text-black px-2 py-2 md:px-2 md:py-2 xl:px-4 xl:py-1 rounded-sm hover:bg-primary/70 transition-colors duration-200"
                    >
                      <img src={Downloadicon.src} alt="Download" className="" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
              </div>
            )}
          </>
        )}

        {/* Pagination Controls */}
        {!loading && filteredData.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-roboto font-medium"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-6 py-2 rounded-lg font-roboto font-medium transition-colors ${currentPage === page
                    ? 'bg-white/50 text-white'
                    : 'bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-roboto font-medium"
            >
              Next
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

export default function TopChartsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#081028] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <TopChartsContent />
    </Suspense>
  );
} 