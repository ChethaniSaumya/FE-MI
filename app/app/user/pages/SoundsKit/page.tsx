'use client'
import { IoMdArrowDropdown } from "react-icons/io";
import Navbar from '../../components/Navbar'
import Musicdata from '../musicdata.json'
import Dropdown from '../../dropdown.json'
import Filters from '../../filters.json'
import React, { useEffect, useState } from 'react'
import Downloadicon from '../../images/icon/Download.svg'
import Image from '../../images/songimage/song.png'
import SoundskitCarousel from '../../components/SoundskitCarousel'
import Footer from '../../components/Footer'
import data from '../../data.json'
import { soundKitAPI, imageAPI, tagAPI, soundKitCategoryAPI, downloadAPI } from '../../../utils/api'
import { FaPlay, FaPause } from 'react-icons/fa'

export default function TopChartsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [screenSize, setScreenSize] = useState('mobile');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Tag and category filtering state
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategoryTag, setSelectedCategoryTag] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search state for track_tags
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio player state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Dropdown filter states
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedBPM, setSelectedBPM] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedKitType, setSelectedKitType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMusician, setSelectedMusician] = useState<string | null>(null);
  
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

  // Load sound kits, tags, and categories from DB
  const [kits, setKits] = useState<any[]>([]);
  const [kitsLoading, setKitsLoading] = useState(true);
  const [tags, setTags] = useState<any[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const getImageUrl = (img?: string | null) => {
    if (!img) return '/vercel.svg';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.length === 24) return imageAPI.getImage(img);
    return img;
  };

  // Helper function to get tag name by ID
  const getTagName = (tagId: string) => {
    if (!tagId || !tags || tags.length === 0) return tagId;
    
    const tag = tags.find(t => t.id === tagId);
    console.log(`Looking for tag ID: ${tagId}, found:`, tag);
    
    if (tag && tag.name) {
      return tag.name;
    }
    
    // If no tag found, return the ID as fallback
    return tagId;
  };

  // Helper function to get tag ID by name
  const getTagId = (tagName: string) => {
    if (!tagName || !tags || tags.length === 0) return tagName;
    
    const tag = tags.find(t => t.name === tagName);
    console.log(`Looking for tag name: ${tagName}, found:`, tag);
    
    if (tag && tag.id) {
      return tag.id;
    }
    
    // If no tag found, return the name as fallback
    return tagName;
  };

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string) => {
    if (!categoryId || !categories || categories.length === 0) return categoryId;
    
    const category = categories.find(c => c.id === categoryId);
    console.log(`Looking for category ID: ${categoryId}, found:`, category);
    
    if (category && category.name) {
      return category.name;
    }
    
    // If no category found, return the ID as fallback
    return categoryId;
  };

  // Helper function to get category ID by name
  const getCategoryId = (categoryName: string) => {
    if (!categoryName || !categories || categories.length === 0) return categoryName;
    
    const category = categories.find(c => c.name === categoryName);
    console.log(`Looking for category name: ${categoryName}, found:`, category);
    
    if (category && category.id) {
      return category.id;
    }
    
    // If no category found, return the name as fallback
    return categoryName;
  };

  // Helper function to get price range display
  const getPriceRange = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice) || numPrice === 0) return 'Free';
    if (numPrice <= 5) return '$1-$5';
    if (numPrice <= 10) return '$6-$10';
    if (numPrice <= 20) return '$11-$20';
    if (numPrice <= 50) return '$21-$50';
    if (numPrice <= 100) return '$51-$100';
    return '$100+';
  };

  // Handle track play/pause
  const handlePlayPause = (kit: any) => {
    try {
      if (!kit.kitFile) {
        alert('No sound kit file available for preview');
        return;
      }

      // If clicking the same kit that's currently playing, toggle play/pause
      if (currentPlayingTrack === kit.id) {
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

      // Create new audio element for the selected kit
      const newAudio = new Audio(kit.kitFile);
      newAudio.preload = 'metadata';
      
      // Set up event listeners
      newAudio.addEventListener('loadstart', () => {
        console.log('Loading sound kit:', kit.kitName);
      });
      
      newAudio.addEventListener('canplay', () => {
        console.log('Sound kit ready to play:', kit.kitName);
      });
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentPlayingTrack(null);
        setAudioElement(null);
      });
      
      newAudio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        alert('Failed to load sound kit for preview');
        setIsPlaying(false);
        setCurrentPlayingTrack(null);
        setAudioElement(null);
      });

      // Start playing the new kit
      setCurrentPlayingTrack(kit.id);
      setAudioElement(newAudio);
      newAudio.play();
      setIsPlaying(true);
      
    } catch (error) {
      console.error('Play error:', error);
      alert('Failed to play sound kit');
    }
  };

  // Handle sound kit download
  const handleDownload = async (kit: any) => {
    try {
      if (!kit.kitFile) {
        alert('No sound kit file available for download');
        return;
      }

      // Create a filename from kit name
      const fileName = `${kit.kitName.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      
      const result = await downloadAPI.downloadFile(kit.kitFile, fileName);
      
      if (result.success) {
        console.log('Download started successfully');
      } else {
        alert('Failed to download sound kit: ' + result.error);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download sound kit');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setKitsLoading(true);
        setTagsLoading(true);
        setCategoriesLoading(true);
        
        // Load sound kits
        const kitsRes = await soundKitAPI.getSoundKits();
        if (kitsRes?.success) {
          setKits(kitsRes.soundKits || []);
          console.log('Loaded sound kits:', kitsRes.soundKits);
        }
        
        // Load tags
        console.log('Calling tagAPI.getTags()...');
        const tagsRes = await tagAPI.getTags();
        console.log('Tags API response:', tagsRes);
        console.log('Tags API response type:', typeof tagsRes);
        console.log('Tags API response keys:', tagsRes ? Object.keys(tagsRes) : 'No response');
        
        if (tagsRes?.success) {
          setTags(tagsRes.tags || []);
          console.log('Loaded tags successfully:', tagsRes.tags);
          console.log('Tags array length:', tagsRes.tags?.length || 0);
          if (tagsRes.tags && tagsRes.tags.length > 0) {
            console.log('First tag sample:', tagsRes.tags[0]);
            console.log('First tag structure:', Object.keys(tagsRes.tags[0]));
          }
        } else {
          console.error('Failed to load tags:', tagsRes);
          console.error('Tags response error:', tagsRes?.error || 'Unknown error');
        }
        
        // Load categories
        console.log('Calling soundKitCategoryAPI.getCategories()...');
        const categoriesRes = await soundKitCategoryAPI.getCategories();
        console.log('Categories API response:', categoriesRes);
        
        if (categoriesRes?.success) {
          setCategories(categoriesRes.categories || []);
          console.log('Loaded categories successfully:', categoriesRes.categories);
          console.log('Categories array length:', categoriesRes.categories?.length || 0);
          if (categoriesRes.categories && categoriesRes.categories.length > 0) {
            console.log('First category sample:', categoriesRes.categories[0]);
            console.log('First category structure:', Object.keys(categoriesRes.categories[0]));
          }
        } else {
          console.error('Failed to load categories:', categoriesRes);
          console.error('Categories response error:', categoriesRes?.error || 'Unknown error');
        }
      } catch (e) {
        console.error('Load data error:', e);
      } finally {
        setKitsLoading(false);
        setTagsLoading(false);
        setCategoriesLoading(false);
      }
    };
    load();
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

  // Filter sound kits based on selected tag, dropdown filters, carousel filter, and search query
  const filteredKits = kits.filter(kit => {
    // Carousel filter (highest priority)
    if (carouselFilter && carouselFilteredData.length > 0) {
      const isInCarouselFilter = carouselFilteredData.some(filteredTrack => filteredTrack.id === kit.id);
      if (!isInCarouselFilter) return false;
    }
    
    // Search query filtering (filter by category names)
    if (searchQuery.trim()) {
      const kitCategoryName = getCategoryName(kit.category);
      const kitName = kit.kitName || '';
      const kitProducer = kit.producer || '';
      
      // Search in category name, kit name, and producer name
      const searchLower = searchQuery.toLowerCase();
      const matchesCategory = kitCategoryName.toLowerCase().includes(searchLower);
      const matchesName = kitName.toLowerCase().includes(searchLower);
      const matchesProducer = kitProducer.toLowerCase().includes(searchLower);
      
      if (!matchesCategory && !matchesName && !matchesProducer) return false;
    }
    
    // Tag filtering (if selectedTag is set)
    if (selectedTag) {
      // Try different possible field names for tags
      let kitTags: string[] = [];
      if (kit.tags) {
        kitTags = Array.isArray(kit.tags) 
          ? kit.tags 
          : typeof kit.tags === 'string' 
            ? kit.tags.split(',').map((tagId: string) => tagId.trim())
            : [];
      } else if (kit.trackTags) {
        kitTags = Array.isArray(kit.trackTags) 
          ? kit.trackTags 
          : typeof kit.trackTags === 'string' 
            ? kit.trackTags.split(',').map((tagId: string) => tagId.trim())
            : [];
      }
      
      // Convert the selected tag name to ID and check if it exists in the kit's tags
      const selectedTagId = getTagId(selectedTag);
      const hasSelectedTag = kitTags.some((tagId: string) => 
        tagId === selectedTagId
      );
      if (!hasSelectedTag) return false;
    }
    
    // Category tag filtering (if selectedCategoryTag is set)
    if (selectedCategoryTag) {
      const kitCategoryName = getCategoryName(kit.category);
      if (kitCategoryName !== selectedCategoryTag) return false;
    }
    
    // Dropdown filters
    if (selectedKitType && kit.kitType !== selectedKitType) return false;
    if (selectedCategory && getCategoryName(kit.category) !== selectedCategory) return false;
    if (selectedPrice && getPriceRange(kit.price || 0) !== selectedPrice) return false;
    if (selectedBPM && kit.bpm !== selectedBPM) return false;
    if (selectedDuration && kit.duration !== selectedDuration) return false;
    if (selectedMusician && kit.producer !== selectedMusician) return false;
    
    return true;
  });

  // Pagination logic
  const totalCards = filteredKits.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = filteredKits.slice(startIndex, endIndex);

  // Log filtering summary
  console.log(`=== SOUND KITS PAGE ===`);
  console.log(`Total sound kits in database: ${kits.length}`);
  console.log(`Currently filtered sound kits: ${filteredKits.length}`);
  console.log(`Sound kits being displayed: ${currentCards.length}`);
  console.log(`Current page: ${currentPage} of ${totalPages}`);
  
  if (selectedTag) {
    console.log(`Selected Tag: "${selectedTag}"`);
  }
  console.log(`=======================`);

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
        console.log('Selecting new tag:', tag, 'Previous tag deselected');
      }
      // Reset to first page when filtering
      setCurrentPage(1);
      setIsRefreshing(false);
    }, 300); // 300ms refresh delay
  };

  // Handle category tag selection
  const handleCategoryTagClick = (categoryName: string) => {
    console.log('Category tag clicked:', categoryName, 'Previous selected:', selectedCategoryTag);
    
    // Add refresh effect
    setIsRefreshing(true);
    
    setTimeout(() => {
      if (selectedCategoryTag === categoryName) {
        // If clicking the same category tag, deselect it
        setSelectedCategoryTag(null);
        console.log('Deselecting category tag, showing all data');
      } else {
        // Always select the new category tag (deselect previous one)
        setSelectedCategoryTag(categoryName);
        console.log('Selecting new category tag:', categoryName, 'Previous category tag deselected');
      }
      // Reset to first page when filtering
      setCurrentPage(1);
      setIsRefreshing(false);
    }, 300); // 300ms refresh delay
  };

  // Handle search input for categories, names, and producers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    console.log('Searching for categories, names, or producers containing:', query);
  };


  // Handle dropdown option selection
  const handleDropdownOption = (category: string, value: string) => {
    console.log('Dropdown option selected:', category, value);
    
    // Update the appropriate state based on category
    switch (category) {
      case 'Kit Type':
        setSelectedKitType(selectedKitType === value ? null : value);
        break;
      case 'Category':
        setSelectedCategory(selectedCategory === value ? null : value);
        break;
      case 'Price Range':
        setSelectedPrice(selectedPrice === value ? null : value);
        break;
      case 'BPM':
        setSelectedBPM(selectedBPM === value ? null : value);
        break;
      case 'Duration':
        setSelectedDuration(selectedDuration === value ? null : value);
        break;
      case 'Musician':
        setSelectedMusician(selectedMusician === value ? null : value);
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

  // Clear all filters
  const clearAllFilters = () => {
    setCarouselFilter(null);
    setCarouselFilteredData([]);
    setSelectedTag(null);
    setSelectedCategoryTag(null);
    setSearchQuery('');
    setSelectedKitType(null);
    setSelectedCategory(null);
    setSelectedPrice(null);
    setSelectedBPM(null);
    setSelectedDuration(null);
    setSelectedMusician(null);
    sessionStorage.removeItem('selectedFilter');
    sessionStorage.removeItem('filteredMusicData');
    console.log('All filters cleared');
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
      <div className="">
      <Navbar />
      </div>
      <div className="containerpaddin   container mx-auto  pt-34 sm:pt-28 md:pt-32 lg:pt-36 ">
        <h1 className="text-white text-4xl font-roboto font-bold mb-4">Sound Kits</h1>
        <SoundskitCarousel />
        <div className='md:flex items-center  overflow-hidden'>
          <div className='bg-black/40 backdrop-blur-sm rounded-full border border-white/50 '>
            <div className="flex items-center justify-between py-1 px-2">
              <div className="flex items-center flex-1 min-w-0">
                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by category, name, or producer..."
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
            {tagsLoading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                <span className="text-sm">Loading tags...</span>
              </div>
            ) : (
              <>
                {/* Collect all unique tags from sound kits and filter by search query */}
                {(() => {
                  const allTagNames = new Set<string>();
                  
                  console.log('Processing kits for tags:', kits);
                  console.log('Available tags from database:', tags);
                  console.log('Tags array length:', tags.length);
                  console.log('Sample tag from database:', tags[0]);
                  console.log('Tags structure:', tags.map(t => ({ id: t.id, name: t.name })));
                  
                  // If tags are not loaded from database, show a message
                  if (!tags || tags.length === 0) {
                    return (
                      <div className="text-red-400 text-sm p-2 bg-red-900/20 rounded">
                        ⚠️ Tags not loaded from database. Please check the API connection.
                        <br />
                        <div className="mt-2 text-xs">
                          Expected endpoint: GET /api/tags
                          <br />
                          Current tags state: {tags ? `Array with ${tags.length} items` : 'undefined'}
                          <br />
                          <button 
                            onClick={() => {
                              // Test with sample tags that match your actual IDs
                              const sampleTags = [
                                { id: '68aeba4db980a3ac6ba443a3', name: 'Hip Hop' },
                                { id: '68b6079432bd3b3be2f886c0', name: 'Electronic' },
                                { id: '68b6079432bd3b3be2f886c1', name: 'Jazz' }
                              ];
                              setTags(sampleTags);
                              console.log('Set sample tags:', sampleTags);
                            }} 
                            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 mr-2"
                          >
                            Test with Sample Tags
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                console.log('Testing API call manually...');
                                const response = await fetch('http://localhost:3001/api/tags');
                                const data = await response.json();
                                console.log('Manual API test result:', data);
                                if (data.success) {
                                  setTags(data.tags);
                                }
                              } catch (error) {
                                console.error('Manual API test failed:', error);
                              }
                            }} 
                            className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 mr-2"
                          >
                            Test API Manually
                          </button>
                        </div>
                        <button 
                          onClick={() => window.location.reload()} 
                          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reload Page
                        </button>
                      </div>
                    );
                  }
                  
                  kits.forEach(kit => {
                    console.log('Kit:', kit.kitName, 'Tags field:', kit.tags, 'Tags field type:', typeof kit.tags);
                    
                    // Try different possible field names for tags
                    let kitTags: string[] = [];
                    if (kit.tags) {
                      kitTags = Array.isArray(kit.tags) 
                        ? kit.tags 
                        : typeof kit.tags === 'string' 
                          ? kit.tags.split(',').map((tagId: string) => tagId.trim())
                          : [];
                    } else if (kit.trackTags) {
                      kitTags = Array.isArray(kit.trackTags) 
                        ? kit.trackTags 
                        : typeof kit.trackTags === 'string' 
                          ? kit.trackTags.split(',').map((tagId: string) => tagId.trim())
                          : [];
                    }
                    
                    console.log('Processed kit tags:', kitTags);
                    
                    // Convert tag IDs to readable names using the tags from database
                    kitTags.forEach((tagId: string) => {
                      if (tagId && tagId.trim()) {
                        console.log(`Processing tag ID: ${tagId}`);
                        
                        // Find the tag in the database
                        const foundTag = tags.find(t => t.id === tagId);
                        console.log(`Found tag for ID ${tagId}:`, foundTag);
                        
                        if (foundTag && foundTag.name) {
                          // Successfully found tag name
                          allTagNames.add(foundTag.name);
                          console.log(`Added tag name: ${foundTag.name}`);
                        } else {
                          // Tag not found in database - skip it instead of showing "Unknown Tag"
                          console.warn(`Tag ID ${tagId} not found in database - skipping`);
                          // Don't add unknown tags to the display
                        }
                      }
                    });
                  });
                  
                  console.log('All collected tag names:', Array.from(allTagNames));
                  
                  // Filter out any "Unknown Tag" entries and filter by search query
                  const validTags = Array.from(allTagNames).filter(tagName => 
                    !tagName.startsWith('Unknown Tag (') && tagName.trim() !== ''
                  );
                  
                const filteredTags = searchQuery.trim() 
                    ? validTags.filter(tagName => 
                        tagName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : validTags;
                  
                  console.log('All collected tags (before filtering):', Array.from(allTagNames));
                  console.log('Valid tags (after removing Unknown Tags):', validTags);
                  console.log('Filtered tags for display:', filteredTags);
                  
                  // Show what was filtered out
                  const removedTags = Array.from(allTagNames).filter(tagName => 
                    tagName.startsWith('Unknown Tag (') || tagName.trim() === ''
                  );
                  if (removedTags.length > 0) {
                    console.log('Removed Unknown Tags:', removedTags);
                  }
                  
                  // If no tags found, don't show anything
                  if (filteredTags.length === 0) {
                    return null;
                  }
                  
                  return filteredTags.map((tagName: string, index: number) => (
                  <div key={`tag-${index}`} className='flex-shrink-0'>
                    <div 
                      className={`backdrop-blur-sm rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          selectedTag === tagName 
                          ? 'bg-white/60 border-white/80 text-black' 
                          : 'bg-black/40 border-white/50 text-white hover:bg-black/60'
                      }`}
                        onClick={() => handleTagClick(tagName)}
                    >
                      <div className="py-1 px-1 flex items-center justify-center w-full">
                        <p className={`font-roboto font-light-300 px-4 ${
                            selectedTag === tagName ? 'text-black' : 'text-white'
                          }`}>
                            {tagName}
                            {selectedTag === tagName && <span className="ml-1">✓</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </>
            )}
            
            {/* Category Tags Section */}
            {!categoriesLoading && categories && categories.length > 0 && (
              <>
                {/* Separator */}
                
                
                {/* Category Tags */}
                <div className="flex items-center gap-2">
                  
                  {categories.map((category: any, index: number) => (
                    <div key={`category-tag-${index}`} className='flex-shrink-0'>
                      <div 
                        className={`backdrop-blur-sm rounded-full border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          selectedCategoryTag === category.name
                            ? 'bg-primary/80 border-primary text-black' 
                            : 'bg-black/40 border-white/50 text-white hover:bg-black/60'
                        }`}
                        onClick={() => handleCategoryTagClick(category.name)}
                      >
                        <div className="py-1 px-1 flex items-center justify-center w-full">
                          <p className={`font-roboto font-light-300 px-3 text-sm ${
                            selectedCategoryTag === category.name ? 'text-black font-semibold' : 'text-white'
                          }`}>
                            {category.name}
                            {selectedCategoryTag === category.name && <span className="ml-1">✓</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
              </>
            )}
          </div>
        </div>

        {/* Dropdown Filters Row - Similar to tracks page */}
        <div
          className='flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing py-2 mt-4'
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex items-center justify-center gap-4">
            {/* Show loading state if categories are still loading */}
            {categoriesLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                <span className="text-sm">Loading categories...</span>
              </div>
            )}
            

            
            {/* Dynamic dropdown buttons for sound kit filters */}
            {(() => {
              // Extract unique values from sound kits for each category
              // For prices, use price ranges instead of individual prices
              const priceRanges = [...new Set(kits.map(kit => getPriceRange(kit.price || 0)))];
              const bpms = [...new Set(kits.map(kit => kit.bpm).filter(Boolean))];
              const durations = [...new Set(kits.map(kit => kit.duration).filter(Boolean))];
              const kitTypes = [...new Set(kits.map(kit => kit.kitType).filter(Boolean))];
              
              // Use categories directly from database instead of extracting from kits
              let categoryOptions: string[] = [];
              if (categories && categories.length > 0) {
                // Use the actual category names from the database
                categoryOptions = categories.map(cat => cat.name).filter(Boolean);
                console.log('Using category names from database:', categoryOptions);
              } else {
                // Fallback: show raw category IDs if categories aren't loaded yet
                categoryOptions = [...new Set(kits.map(kit => kit.category).filter(Boolean))];
                console.log('Using raw category IDs (categories not loaded yet):', categoryOptions);
              }
              
              const musicians = [...new Set(kits.map(kit => kit.producer).filter(Boolean))];
              
              // Sort arrays for better user experience
              // Sort price ranges in a logical order
              const priceRangeOrder = ['Free', '$1-$5', '$6-$10', '$11-$20', '$21-$50', '$51-$100', '$100+'];
              priceRanges.sort((a, b) => {
                const aIndex = priceRangeOrder.indexOf(a);
                const bIndex = priceRangeOrder.indexOf(b);
                return aIndex - bIndex;
              });
              bpms.sort();
              durations.sort();
              kitTypes.sort();
              categories.sort();
              musicians.sort();
              
              // Build dropdowns array, only including Category if categories are loaded
              const allDropdowns = [
                { id: 1, category: "Kit Type", options: kitTypes },
                { id: 2, category: "Category", options: categoryOptions, show: categoryOptions && categoryOptions.length > 0 },
                { id: 3, category: "Price Range", options: priceRanges },
                { id: 4, category: "BPM", options: bpms },
                { id: 5, category: "Duration", options: durations },
                { id: 6, category: "Musician", options: musicians }
              ];
              
              // Filter out empty arrays and categories that aren't loaded
              const validDropdowns = allDropdowns.filter(dropdown => 
                dropdown.options.length > 0 && 
                (dropdown.category !== "Category" || (dropdown as any).show !== false)
              );
              
              // Additional debug for dropdown filtering
              console.log('All dropdowns:', allDropdowns.map(d => ({ category: d.category, optionsCount: d.options.length, show: (d as any).show })));
              console.log('Valid dropdowns:', validDropdowns.map(d => ({ category: d.category, optionsCount: d.options.length })));
              
              // Debug logging for dropdown data
              console.log('Dropdown data extracted:', {
                kitTypes: kitTypes.length,
                categoryOptions: categoryOptions.length,
                priceRanges: priceRanges.length,
                bpms: bpms.length,
                durations: durations.length,
                musicians: musicians.length,
                validDropdowns: validDropdowns.length
              });
              
              // Debug logging for categories specifically
              console.log('Categories from database:', categories);
              console.log('Categories state:', categories);
              console.log('Category options for dropdown:', categoryOptions);
              console.log('Sample kit categories:', kits.slice(0, 3).map(kit => ({
                kitId: kit.id,
                categoryId: kit.category,
                categoryName: getCategoryName(kit.category)
              })));
              
              // Additional debugging for category conversion
              if (kits.length > 0) {
                console.log('First kit category field:', kits[0].category);
                console.log('First kit category type:', typeof kits[0].category);
                console.log('Categories array structure:', categories.map(c => ({ id: c.id, name: c.name })));
              }
              
              // Debug display for category dropdown options
              console.log('=== CATEGORY DROPDOWN DEBUG ===');
              console.log('Categories loaded from DB:', categories.length);
              console.log('Category options for dropdown:', categoryOptions);
              console.log('Category dropdown will show:', categoryOptions.length > 0 ? categoryOptions : 'NO OPTIONS');
              console.log('================================');

              return validDropdowns.map((dropdown) => (
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
                      className={`transition-transform duration-200 ${openDropdown === dropdown.id ? "rotate-180" : ""}`}
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
                        {/* Dynamic options mapped from sound kits data */}
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
          </div>
          
          
        </div>
        

        {(carouselFilter || selectedTag || selectedCategoryTag || searchQuery || selectedKitType || selectedCategory || selectedPrice || selectedBPM || selectedDuration || selectedMusician) && (
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
                    onClick={() => setSelectedTag(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedCategoryTag && (
                <span>
                  <strong>Category Tag:</strong> <span className="text-primary font-bold">{selectedCategoryTag}</span>
                  <button 
                    onClick={() => setSelectedCategoryTag(null)}
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
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedKitType && (
                <span>
                  <strong>Kit Type:</strong> <span className="text-primary font-bold">{selectedKitType}</span>
                  <button 
                    onClick={() => setSelectedKitType(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedCategory && (
                <span>
                  <strong>Category:</strong> <span className="text-primary font-bold">{selectedCategory}</span>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedPrice && (
                <span>
                  <strong>Price Range:</strong> <span className="text-primary font-bold">{selectedPrice}</span>
                  <button 
                    onClick={() => setSelectedPrice(null)}
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
              {selectedDuration && (
                <span>
                  <strong>Duration:</strong> <span className="text-primary font-bold">{selectedDuration}</span>
                  <button 
                    onClick={() => setSelectedDuration(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              {selectedMusician && (
                <span>
                  <strong>Musician:</strong> <span className="text-primary font-bold">{selectedMusician}</span>
                  <button 
                    onClick={() => setSelectedMusician(null)}
                    className="ml-2 text-primary hover:text-white text-xs underline"
                  >
                    ✕
                  </button> | 
                </span>
              )}
              <strong>Showing:</strong> {filteredKits.length} sound kits | 
              <strong>Total:</strong> {kits.length} sound kits
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-white text-xs">
                <strong>Active Filters:</strong> {[
                  carouselFilter && 'Carousel',
                  selectedTag && 'Tag',
                  selectedCategoryTag && 'Category Tag',
                  searchQuery && 'Search',
                  selectedKitType && 'Kit Type',
                  selectedCategory && 'Category',
                  selectedPrice && 'Price Range',
                  selectedBPM && 'BPM',
                  selectedDuration && 'Duration',
                  selectedMusician && 'Musician'
                ].filter(Boolean).join(', ')}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Refresh indicator */}
        {isRefreshing && (
          <div className="mt-4 mb-4 p-3 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-white">Refreshing...</span>
          </div>
        )}

        {kitsLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!kitsLoading && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 items-stretch scrollbar-hide mt-9 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {currentCards.map((kit: any) => (
              <div key={kit.id} className='h-full'>
                <div className="flex flex-col h-full">
                  <div className="w-full aspect-square sm:aspect-[4/5] md:aspect-square lg:aspect-[4/5] overflow-hidden rounded-sm bg-black/20 relative group">
                    <img 
                      src={getImageUrl(kit.kitImage)} 
                      className="w-full h-full object-cover hover:brightness-110 transition-all duration-200 cursor-pointer" 
                      alt={kit.kitName || 'Sound Kit'} 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vercel.svg'; }}
                    />
                    {/* Play/Pause Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handlePlayPause(kit)}
                        className="bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                        title={currentPlayingTrack === kit.id && isPlaying ? 'Pause' : 'Play'}
                      >
                        {currentPlayingTrack === kit.id && isPlaying ? (
                          <FaPause className="w-4 h-4" />
                        ) : (
                          <FaPlay className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <h1 className="text-white text-md font-roboto font-bold mt-2 line-clamp-2">{kit.kitName}</h1>
                  <h1 className="text-white text-sm font-roboto">{kit.producer}</h1>
                  <div className="grid grid-cols-8 gap-2 mt-auto">
                    <button className="grid col-span-6 bg-white/20 backdrop-blur-sm rounded-full font-bold text-white justify-center items-center rounded-sm hover:bg-white/30 transition-colors duration-200">
                      {getPriceRange(kit.price || 0)}
                    </button>
                    <button 
                      onClick={() => handleDownload(kit)}
                      className="grid col-span-2 bg-primary text-black px-2 py-2 md:px-2 md:py-2 xl:px-4 xl:py-1 rounded-sm hover:bg-primary/70 transition-colors duration-200"
                    >
                      <img src={Downloadicon.src} alt="Download" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
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