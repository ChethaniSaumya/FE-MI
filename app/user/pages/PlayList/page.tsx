'use client'
import React, { useState, useRef } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { RiArrowLeftSLine, RiArrowRightSLine, RiAddLine } from 'react-icons/ri'

function page() {
  const [playlists, setPlaylists] = useState<Array<{id: number, name: string, image: string | null, songCount: number}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPlaylist = {
          id: playlists.length + 1,
          name: `Favourite ${playlists.length + 1}`,
          image: e.target?.result as string,
          songCount: 0
        };
        setPlaylists(prev => [...prev, newPlaylist]);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className=''>
      <Navbar />

      <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
        <div className='flex justify-between items-center'>
          <div className='text-title text-white font-bold text-[26px] md:text-[40px] lg:text-[30px] xl:text-[40px] 2xl:text-[40px] font-bold '>
            My Favourite List
          </div>

        </div>
        

        
        {/* Hidden file input for image upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        
        {/* Playlist Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
          {/* Add New Playlist Card */}
          <div
            onClick={handleCardClick}
            className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30 p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition-colors min-h-[200px]"
          >
            {isUploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-white text-sm">Uploading...</p>
              </div>
            ) : (
              <>
                <RiAddLine size={32} className="text-white/70 mb-3" />
                <p className="text-white/70 text-sm text-center">Click to add favourite track</p>
              </>
            )}
          </div>
          
          {/* Existing Playlist Cards */}
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/20 transition-colors cursor-pointer group"
            >
              <div className="aspect-square relative">
                {playlist.image ? (
                  <img
                    src={playlist.image}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white/50 text-4xl">🎵</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    Edit
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium mb-1 truncate">{playlist.name}</h3>
                <p className="text-gray-400 text-sm">{playlist.songCount} songs</p>
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