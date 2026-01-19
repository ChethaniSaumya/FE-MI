import React from 'react'
import Cd from '../images/icon/cd.png'
import data from '../data.json'
import Forword from '../images/icon/Forward.svg'
import { useState } from 'react'

function First_carousel() {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState(data);

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

  const handleScrollLeft = () => {
    const container = document.querySelector('.carousel-container') as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    const container = document.querySelector('.carousel-container') as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleFilterClick = (filterType: string) => {
    // If clicking the same filter, clear it
    if (selectedFilter === filterType) {
      setSelectedFilter(null);
      setFilteredData(data);
      sessionStorage.removeItem('filteredMusicData');
      sessionStorage.removeItem('selectedFilter');
      console.log('Filter cleared');
      return;
    }
    
    setSelectedFilter(filterType);
    
    let filtered: any[] = [];
    
    switch (filterType) {
      case 'Under $20':
        filtered = data.filter(track => parseInt(track.track_price) < 20);
        break;
      case 'Free Beat':
        filtered = data.filter(track => parseInt(track.track_price) === 0);
        break;
      case 'Beat':
        filtered = data.filter(track => track.track_type === 'Beat');
        break;
      case 'Beat w/ Hook':
        filtered = data.filter(track => track.track_type === 'Beat w/ Hook');
        break;
      case 'Top Lines':
        filtered = data.filter(track => track.track_type === 'Top Lines');
        break;
      case 'New & Notable':
        // Filter for recent tracks (you can adjust this logic)
        filtered = data.slice(0, 20); // Show first 10 tracks as "new"
        break;
      case 'For You':
        // Filter based on user preferences (you can customize this)
        filtered = data.filter(track => parseInt(track.download_count) > 100);
        break;
      case 'Top Charts':
        // Filter for popular tracks
        filtered = data.filter(track => parseInt(track.download_count) > 150);
        break;
      case 'Exclusive Only':
        // Filter for exclusive tracks (you can customize this)
        filtered = data.filter(track => parseInt(track.track_price) > 700);
        break;
      default:
        filtered = data;
    }
    
    setFilteredData(filtered);
    
    // Store the filtered data in session storage for other components to access
    sessionStorage.setItem('filteredMusicData', JSON.stringify(filtered));
    sessionStorage.setItem('selectedFilter', filterType);
    
    console.log(`Filter applied: ${filterType}, Found ${filtered.length} tracks`);
  };

  return (
    <div className='container mx-auto relative '>
      {/* Filter Status Indicator */}
      {selectedFilter && (
        <div className='px-2 mb-4'>
          <div className='bg-blue-500/20 backdrop-blur-sm rounded-lg border border-blue-400/50 p-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <span className='text-blue-300 text-sm font-medium'>Active Filter:</span>
                <span className='text-white font-semibold'>{selectedFilter}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-blue-300 text-sm'>{filteredData.length} tracks found</span>
                <button 
                  onClick={() => handleFilterClick(selectedFilter)}
                  className='text-blue-300 hover:text-white text-sm underline'
                >
                  Clear Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='px-2'>

      </div>

      {/* Left Arrow */}
      <button
        onClick={handleScrollLeft}
        className='absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors'
      >
        <img src={Forword.src} alt="Previous" className='w-6 h-6 rotate-180' />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleScrollRight}
        className='absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors'
      >
        <img src={Forword.src} alt="Next" className='w-6 h-6' />
      </button>

      <div
        className='flex items-center gap-2 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing my-10 carousel-container rounded-sm'
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >

        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'New & Notable' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('New & Notable')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>New & Notable</h1>
              </div>
            </div>
          </div>
        </div>
        

        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'For You' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('For You')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>For You</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Top Charts' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Top Charts')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Top Charts</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Exclusive Only' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Exclusive Only')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Exclusive Only</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Under $20' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Under $20')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Under $20</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Free Beat' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Free Beat')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Free Beat</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Beat' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Beat')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Beat</h1>
              </div>
            </div>
          </div>
        </div>


        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Beat w/ Hook' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Beat w/ Hook')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Beat w/ Hook</h1>
              </div>
            </div>
          </div>
        </div>



        <div className='flex-shrink-0'>
          <div 
            className={`h-50 w-50 backdrop-blur-sm rounded-sm relative items-center justify-center cursor-pointer transition-all duration-300 ${
              selectedFilter === 'Top Lines' 
                ? 'bg-blue-500/60 border-2 border-blue-400' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
            onClick={() => handleFilterClick('Top Lines')}
          >
            <div className='flex flex-col items-center justify-center'>
              <img src={Cd.src} alt="Cd" className='w-40 h-40' />
              <div className='flex flex-col items-center justify-center '>
                <h1 className='text-white text-lg font-roboto font-semibold'>Top Lines</h1>
              </div>
            </div>
          </div>
        </div>




      </div>
    </div>

  )
}

export default First_carousel