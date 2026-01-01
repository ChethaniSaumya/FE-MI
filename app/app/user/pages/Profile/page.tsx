'use client'
import React, { useState, useRef, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import musicData from '../musicdata.json'
import { RiYoutubeLine, RiArrowRightSLine, RiArrowLeftSLine, RiMenu3Line, RiCloseLine } from "react-icons/ri";
import { BsTiktok } from "react-icons/bs";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import Profileimage from '../../images/icon/cd.png'
import Downloadicon from '../../images/icon/Download.svg'
import data from '../../data.json'

function page() {
    const Musicdata = musicData;
    const [currentPage, setCurrentPage] = useState(0);
    const [allSongsPage, setAllSongsPage] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedMusicianId, setSelectedMusicianId] = useState(1); // Default to first musician
    const cardsPerPage = 4;
    const allSongsPerPage = 10;

    // Get the specific musician data based on ID
    const selectedMusician = data.find(musician => musician.id === selectedMusicianId);
    
    // Filter music data to show only tracks by the selected musician
    const musicianTracks = data.filter(track => track.musician === selectedMusician?.musician);

    const totalPages = Math.ceil(musicianTracks.length / cardsPerPage);
    const totalAllSongsPages = Math.ceil(musicianTracks.length / allSongsPerPage);
    const startIndex = currentPage * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const displayedCards = musicianTracks.slice(startIndex, endIndex);

    const allSongsStartIndex = (allSongsPage - 1) * allSongsPerPage;
    const allSongsEndIndex = allSongsStartIndex + allSongsPerPage;
    const displayedAllSongs = musicianTracks.slice(allSongsStartIndex, allSongsEndIndex);

    // Get URL parameters to set musician ID
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const musicianId = urlParams.get('id');
        if (musicianId) {
            setSelectedMusicianId(parseInt(musicianId));
        }
    }, []);

    const nextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    const handleAllSongsPageChange = (page: number) => {
        setAllSongsPage(page);
    };

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
        setScrollLeft(containerRef.current?.scrollLeft || 0);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (containerRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2;
        if (containerRef.current) {
            containerRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    // If no musician is found, show loading or error
    if (!selectedMusician) {
        return (
            <div className="relative">
                <Navbar />
                <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                    <div className="text-center text-white">
                        <h1 className="text-2xl font-bold">Musician not found</h1>
                        <p className="text-gray-400">The requested musician profile could not be found.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative">
            <Navbar />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
                {/* Mobile Menu Button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white hover:bg-white/30 transition-colors"
                    >
                        {isSidebarOpen ? <RiCloseLine className="w-6 h-6" /> : <RiMenu3Line className="w-6 h-6" />}
                    </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    {/* Sidebar - Hidden on mobile, visible on desktop */}
                    <div className={`col-span-1 ${isSidebarOpen ? 'fixed left-0 top-0 h-full w-80 z-50 bg-white/20 backdrop-blur-sm overflow-y-auto' : 'hidden'} md:relative md:block md:w-auto md:h-auto md:z-auto md:bg-transparent md:overflow-y-auto`}>
                        <div className='bg-white/20 w-full min-h-full p-4 xl:p-8'>
                            {/* Close Button - Only visible on mobile */}
                            <div className="md:hidden flex justify-end mb-4">
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
                                >
                                    <RiCloseLine className="w-5 h-5" />
                                </button>
                            </div>

                            <div className='p-4 flex justify-center'>
                                <div className='bg-white/20 backdrop-blur-sm rounded-full  flex items-center justify-center'>
                                    <img 
                                        src={selectedMusician.musician_image || Profileimage.src} 
                                        alt={selectedMusician.musician} 
                                        className="w-40 h-40 rounded-full object-cover" 
                                    />
                                </div>
                            </div>

                            <div className='items-center justify-center flex text-white 2xl:text-2xl text-xl font-bold'>
                                <h1>
                                    {selectedMusician.musician}
                                </h1>
                            </div>
                            <div className='items-center justify-center flex text-white text-[12px] 2xl:text-sm mt-2'>
                                <h1 className='text-center'>
                                    {selectedMusician.musician_country}
                                </h1>
                            </div>
                            <div className='items-center justify-center flex mb-10'>
                                <button
                                    onClick={() => window.location.href = '/user/pages/Profile'}
                                    className='bg-blue-500 w-full mt-4 text-white px-2 py-2 md:px-4 md:py-2 xl:px-6 xl:py-1 rounded-full hover:bg-blue-600 transition-colors duration-200 font-bold text-sm'
                                >
                                    Follow
                                </button>
                            </div>
                            <div className='bg-white w-full h-[0.5px] mt-4 mb-4'></div>
                            <div className='flex gap-4 justify-between items-center'>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    Followers
                                </div>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    {selectedMusician.musician_followers_count}
                                </div>
                            </div>

                            <div className='flex gap-4 justify-between items-center'>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    Downloads
                                </div>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    {selectedMusician.musician_downloads_count}
                                </div>
                            </div>

                            <div className='flex gap-4 justify-between items-center'>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    Tracks
                                </div>
                                <div className='font-bold text-white 2xl:text-sm text-xs'>
                                    {selectedMusician.musician_track_count}
                                </div>
                            </div>

                            <div className='bg-white w-full h-[0.5px] mt-4 mb-4'></div>

                            <div className='flex gap-4 justify-between items-center'>
                                <div>
                                    <div className='font-bold text-white text-sm'>
                                        Track Types
                                    </div>
                                    <div className='flex gap-4'>
                                        <div
                                            className='flex flex-wrap items-center gap-2 py-2'
                                        >
                                            {
                                                data.filter(track => track.musician === selectedMusician.musician).map(musicdata => (
                                                    <div key={musicdata.id} className='flex-shrink-0'>
                                                        <div className='bg-black/40 backdrop-blur-sm rounded-full border border-white/50 flex items-center justify-center'>
                                                            <div className="py-1 px-1 flex items-center justify-center w-full">
                                                                <p className='font-roboto font-light-300 text-white px-2 xl:px-2  2xl:px-4 text-[10px] xl:text-[12px] 2xl:text-[16px]'>{musicdata.track_type}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-white w-full h-[0.5px] mt-4 mb-4'></div>

                            <div className='font-bold text-white text-sm'>
                                About Me
                            </div>
                            <div className=' text-white 2xl:text-sm text-xs mt-2'>
                                {selectedMusician.musiciaan_about}
                            </div>

                            <div className='bg-white w-full h-[0.5px] mt-4 mb-4'></div>

                            <div className='font-bold text-white text-sm mb-2'>
                                Find Me On
                            </div>
                            {selectedMusician.musician_social_instalink && (
                                <a 
                                    href={selectedMusician.musician_social_instalink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='flex gap-4 items-center text-white hover:text-blue-400 transition-colors cursor-pointer'
                                >
                                    <div>
                                        <FaInstagram />
                                    </div>
                                    <div>
                                        Instagram
                                    </div>
                                </a>
                            )}

                            {selectedMusician.musician_social_twitterlink && (
                                <a 
                                    href={selectedMusician.musician_social_twitterlink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='flex gap-4 items-center text-white hover:text-blue-400 transition-colors cursor-pointer'
                                >
                                    <div>
                                        <FaTwitter />
                                    </div>
                                    <div>
                                        Twitter
                                    </div>
                                </a>
                            )}

                            {selectedMusician.musician_social_tiktoklink && (
                                <a 
                                    href={selectedMusician.musician_social_tiktoklink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='flex gap-4 items-center text-white hover:text-blue-400 transition-colors cursor-pointer'
                                >
                                    <div>
                                        < BsTiktok />
                                    </div>
                                    <div>
                                        Tik Tok
                                    </div>
                                </a>
                            )}

                            {selectedMusician.musician_social_spotifylink && (
                                <a 
                                    href={selectedMusician.musician_social_spotifylink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='flex gap-4 items-center text-white hover:text-blue-400 transition-colors cursor-pointer'
                                >
                                    <div>
                                        <RiYoutubeLine />
                                    </div>
                                    <div>
                                        Spotify
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right_Side */}
                    <div className='col-span-1 md:col-span-3'>
                        <div className=' w-full h-full'>
                            <div className='text-white  flex justify-between items-center'>
                                <h1 className='text-2xl font-bold'> Popular Songs </h1>

                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 0}
                                        className="text-white hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RiArrowLeftSLine />
                                    </button>
                                    <span className="text-white text-sm">
                                        {currentPage + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages - 1}
                                        className="text-white hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RiArrowRightSLine />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-2 lg:gap-4 mt-4">
                                {
                                    displayedCards.map(musicdata => (
                                        <div key={musicdata.id} className='flex-shrink-0'>
                                            <div className="">
                                                <img src={musicdata.track_image} className="rounded-sm w-full h-full hover:brightness-125 hover:shadow-lg hover:shadow-white/20 transition-all duration-200 cursor-pointer" alt="Description" />
                                                <h1 className="text-white text-md font-roboto font-bold md:text-[10px] lg:text-sm xl:text-sm 2xl:text-sm  mt-2">{musicdata.track_name}</h1>
                                                <h1 className="text-white text-sm md:text-[10px] lg:text-sm xl:text-sm 2xl:text-sm font-roboto  ">{musicdata.musician}</h1>
                                                <div className="grid grid-cols-8 gap-2 mt-2">

                                                    <button className="grid col-span-6 bg-white/20 backdrop-blur-sm rounded-full font-bold text-white justify-center items-center rounded-sm hover:bg-white/30 transition-colors duration-200">$ {musicdata.track_price}</button>
                                                    <button className="grid col-span-2 bg-primary text-black px-2 py-2 md:px-2 md:py-2 xl:px-4 xl:py-1 rounded-sm hover:bg-primary/70 transition-colors duration-200">
                                                        <img src={Downloadicon.src} alt="Download" className="" />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            <div className='text-white  flex justify-between items-center mt-10'>
                                <h1 className='text-2xl font-bold'> All Songs </h1>
                                
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => handleAllSongsPageChange(allSongsPage - 1)}
                                        disabled={allSongsPage === 1}
                                        className="text-white hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RiArrowLeftSLine />
                                    </button>
                                    <span className="text-white text-sm">
                                        {allSongsPage} / {totalAllSongsPages}
                                    </span>
                                    <button
                                        onClick={() => handleAllSongsPageChange(allSongsPage + 1)}
                                        disabled={allSongsPage === totalAllSongsPages}
                                        className="text-white hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RiArrowRightSLine />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-2 lg:gap-4 overflow-x-auto scrollbar-hide mt-9">

                                    {
                                        displayedAllSongs.map(musicdata => (
                                            <div key={musicdata.id} className='flex-shrink-0'>
                                                <div className="">
                                                    <img src={musicdata.track_image} className="rounded-sm w-full h-full hover:brightness-125 hover:shadow-lg hover:shadow-white/20 transition-all duration-200 cursor-pointer" alt="Description" />
                                                    <h1 className="text-white text-md font-roboto font-bold   mt-2">{musicdata.track_name}</h1>
                                                    <h1 className="text-white text-sm font-roboto  ">{musicdata.musician}</h1>
                                                    <div className="grid grid-cols-8 gap-2 mt-2">

                                                        <button className="grid col-span-6 bg-white/20 backdrop-blur-sm rounded-full font-bold text-white justify-center items-center rounded-sm hover:bg-white/30 transition-colors duration-200">$ {musicdata.track_price}</button>
                                                        <button className="grid col-span-2 bg-primary text-black px-2 py-2 md:px-2 md:py-2 xl:px-4 xl:py-1 rounded-sm hover:bg-primary/70 transition-colors duration-200">
                                                            <img src={Downloadicon.src} alt="Download" className="" />
                                                        </button>

                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalAllSongsPages > 1 && (
                                    <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
                                        <button
                                            onClick={() => handleAllSongsPageChange(allSongsPage - 1)}
                                            disabled={allSongsPage === 1}
                                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-roboto font-medium"
                                        >
                                            Previous
                                        </button>

                                        <div className="flex space-x-1">
                                            {Array.from({ length: totalAllSongsPages }, (_, index) => index + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handleAllSongsPageChange(page)}
                                                    className={`px-6 py-2 rounded-lg font-roboto font-medium transition-colors ${allSongsPage === page
                                                        ? 'bg-white/50 text-white'
                                                        : 'bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleAllSongsPageChange(allSongsPage + 1)}
                                            disabled={allSongsPage === totalAllSongsPages}
                                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-roboto font-medium"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default page