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
  FaCheck,
  FaFilePdf
} from 'react-icons/fa'
import jsPDF from 'jspdf'

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
    basePrice: number;      // USD price
    currency: string;       // 'usd' or 'krw'
    createdAt: string;
  };
}

// Exchange rate for display conversion
const USD_TO_KRW_RATE = 1450;

export default function MyLibrary() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

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

  // Convert amount to USD for display
  const getAmountInUSD = (item: LibraryItem): number => {
    const totalAmount = item.orders?.totalAmount || 0;
    const currency = item.orders?.currency || 'usd';
    const basePrice = item.orders?.basePrice;
    
    // If we have basePrice (which should always be in USD), use that
    if (basePrice && basePrice > 0) {
      return basePrice;
    }
    
    // If currency is KRW, convert to USD
    if (currency === 'krw' && totalAmount > 100) {
      // If amount is large (likely KRW), convert to USD
      return totalAmount / USD_TO_KRW_RATE;
    }
    
    // Otherwise assume it's already USD
    return totalAmount;
  };

  // Calculate total spent in USD
  const getTotalSpentUSD = (): number => {
    return library.reduce((sum, item) => sum + getAmountInUSD(item), 0);
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

  const getLicenseRights = (type: string) => {
    switch (type) {
      case 'exclusive':
        return {
          name: 'Exclusive License',
          rights: [
            '✓ Full ownership of the track',
            '✓ Unlimited commercial use',
            '✓ Unlimited distribution',
            '✓ Full monetization rights',
            '✓ No credit required',
            '✓ Track removed from marketplace',
            '✓ Resale rights included'
          ]
        };
      case 'commercial':
        return {
          name: 'Commercial License',
          rights: [
            '✓ Commercial use allowed',
            '✓ Up to 10,000 distributions',
            '✓ Full monetization rights',
            '✓ No credit required',
            '✗ Non-exclusive (others may purchase)',
            '✗ No resale rights'
          ]
        };
      default:
        return {
          name: 'Personal License',
          rights: [
            '✓ Personal, non-commercial use',
            '✓ Single project use',
            '✗ No commercial use',
            '✗ No monetization',
            '✓ Credit required',
            '✗ Non-exclusive'
          ]
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate License PDF
  const handleDownloadLicensePdf = async (item: LibraryItem) => {
    try {
      setGeneratingPdf(item.id);

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header - Logo/Title
      doc.setFillColor(8, 16, 40); // Dark blue background
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      doc.setTextColor(225, 0, 255); // Pink color
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MUSEEDLE', margin, 30);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Music License Certificate', margin, 42);

      y = 70;

      // License Type Badge
      const licenseInfo = getLicenseRights(item.licenseType);
      doc.setFillColor(item.licenseType === 'exclusive' ? 225 : item.licenseType === 'commercial' ? 126 : 34, 
                       item.licenseType === 'exclusive' ? 0 : item.licenseType === 'commercial' ? 215 : 197, 
                       item.licenseType === 'exclusive' ? 255 : item.licenseType === 'commercial' ? 255 : 94);
      doc.roundedRect(margin, y - 8, 80, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(licenseInfo.name.toUpperCase(), margin + 5, y);
      
      y += 20;

      // License Key Box
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, y - 5, pageWidth - (margin * 2), 20, 3, 3, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text('LICENSE KEY', margin + 5, y + 2);
      doc.setFontSize(14);
      doc.setFont('courier', 'bold');
      doc.text(item.licenseKey || 'N/A', margin + 5, y + 12);

      y += 35;

      // Track Information Section
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('TRACK INFORMATION', margin, y);
      
      y += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      
      y += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      
      // Track details
      const details = [
        ['Track Name:', item.tracks?.trackName || 'N/A'],
        ['Artist:', item.tracks?.musician || 'N/A'],
        ['BPM:', item.tracks?.bpm?.toString() || 'N/A'],
        ['Key:', item.tracks?.trackKey || 'N/A'],
      ];

      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, y);
        y += 8;
      });

      y += 10;

      // Purchase Information Section
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('PURCHASE INFORMATION', margin, y);
      
      y += 8;
      doc.line(margin, y, pageWidth - margin, y);
      
      y += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);

      // Use USD amount for PDF
      const amountUSD = getAmountInUSD(item);

      const purchaseDetails = [
        ['Order Number:', item.orders?.orderNumber || 'N/A'],
        ['Purchase Date:', formatDate(item.purchasedAt)],
        ['Amount Paid:', `$${amountUSD.toFixed(2)} USD`],
        ['Buyer:', user ? `${user.firstName} ${user.lastName}` : 'N/A'],
        ['Email:', user?.email || 'N/A'],
      ];

      purchaseDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 45, y);
        y += 8;
      });

      y += 15;

      // License Rights Section
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('LICENSE RIGHTS', margin, y);
      
      y += 8;
      doc.line(margin, y, pageWidth - margin, y);
      
      y += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      licenseInfo.rights.forEach((right) => {
        const isAllowed = right.startsWith('✓');
        doc.setTextColor(isAllowed ? 34 : 200, isAllowed ? 139 : 34, isAllowed ? 34 : 50);
        doc.text(right, margin, y);
        y += 7;
      });

      y += 15;

      // Footer
      doc.setFillColor(8, 16, 40);
      doc.rect(0, 270, pageWidth, 30, 'F');
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('This license certificate is proof of your legal right to use this track according to the terms above.', margin, 278);
      doc.text(`Generated on ${new Date().toLocaleDateString()} | Museedle Music Marketplace`, margin, 285);
      doc.text('For support, contact support@museedle.com', margin, 292);

      // Save PDF
      const fileName = `License_${item.tracks?.trackName?.replace(/[^a-zA-Z0-9]/g, '_') || 'track'}_${item.licenseKey || 'key'}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate license PDF. Please try again.');
    } finally {
      setGeneratingPdf(null);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Tracks</p>
            <p className="text-2xl font-bold text-white">{library.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-white">
              ${getTotalSpentUSD().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Library List */}
        {library.length > 0 ? (
          <div className="space-y-4">
            {library.map((item) => (
              <div 
                key={item.id}
                className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl border border-[#232B43] overflow-hidden hover:border-[#E100FF]/30 transition-colors"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Track Image & Play Button */}
                    <div className="relative w-full md:w-32 h-32 flex-shrink-0">
                      <img 
                        src={item.tracks?.trackImage || '/vercel.svg'} 
                        alt={item.tracks?.trackName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handlePlayPause(item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg hover:bg-black/60 transition-colors"
                      >
                        {currentPlayingId === item.id && isPlaying ? (
                          <FaPause className="text-white text-2xl" />
                        ) : (
                          <FaPlay className="text-white text-2xl ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-white font-bold text-lg">
                            {item.tracks?.trackName}
                          </h3>
                          <p className="text-gray-400 text-sm">{item.tracks?.musician}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLicenseColor(item.licenseType)}`}>
                          {item.licenseType?.charAt(0).toUpperCase() + item.licenseType?.slice(1)} License
                        </span>
                      </div>

                      {/* Track Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-xs" />
                          {formatDate(item.purchasedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaFileAlt className="text-xs" />
                          Order: {item.orders?.orderNumber}
                        </span>
                      </div>

                      {/* License Key */}
                      <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 mb-3">
                        <FaKey className="text-[#E100FF] text-sm" />
                        <code className="text-white text-sm flex-grow font-mono">
                          {item.licenseKey}
                        </code>
                        <button
                          onClick={() => copyLicenseKey(item.licenseKey)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          title="Copy license key"
                        >
                          {copiedKey === item.licenseKey ? (
                            <FaCheck className="text-green-400 text-xs" />
                          ) : (
                            <FaCopy className="text-xs" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(item)}
                        className="flex items-center justify-center gap-2 bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaDownload />
                        <span className="hidden md:inline">Download</span>
                      </button>
                      
                      {/* License PDF Download Button */}
                      <button
                        onClick={() => handleDownloadLicensePdf(item)}
                        disabled={generatingPdf === item.id}
                        className="flex items-center justify-center gap-2 bg-[#7ED7FF] hover:bg-[#7ED7FF]/80 text-black px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {generatingPdf === item.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                        ) : (
                          <FaFilePdf />
                        )}
                        <span className="hidden md:inline">License</span>
                      </button>

                      <button
                        onClick={() => router.push(`/user/pages/Track/${item.trackId}`)}
                        className="flex items-center justify-center gap-2 bg-[#232B43] hover:bg-[#232B43]/80 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaFileAlt />
                        <span className="hidden md:inline">Details</span>
                      </button>
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