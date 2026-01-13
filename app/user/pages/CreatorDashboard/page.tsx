'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  FaMusic, 
  FaChartLine, 
  FaDollarSign, 
  FaEye, 
  FaPlay, 
  FaUpload,
  FaList,
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaArrowUp,
  FaArrowRight
} from 'react-icons/fa'
import { MdTrendingUp } from 'react-icons/md'

interface CreatorStats {
  totalTracks: number;
  totalSales: number;
  totalViews: number;
  totalPlays: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  recentSales: any[];
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchCreatorStats(parsedUser.id);
  }, [router]);

  const fetchCreatorStats = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/creator/stats/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats if API not available yet
      setStats({
        totalTracks: 0,
        totalSales: 0,
        totalViews: 0,
        totalPlays: 0,
        totalEarnings: 0,
        availableBalance: 0,
        pendingBalance: 0,
        recentSales: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43] hover:border-[#E100FF]/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <MdTrendingUp className="text-green-400 text-xl" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  const QuickAction = ({ 
    title, 
    description, 
    icon, 
    onClick, 
    color 
  }: { 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    onClick: () => void;
    color: string;
  }) => (
    <button
      onClick={onClick}
      className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-5 border border-[#232B43] hover:border-[#E100FF] transition-all duration-300 text-left group w-full"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold">{title}</h4>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <FaArrowRight className="text-gray-400 group-hover:text-[#E100FF] transition-colors" />
      </div>
    </button>
  );

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
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, {user?.firstName || 'Creator'}! Here's your overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Tracks"
            value={stats?.totalTracks || 0}
            icon={<FaMusic className="text-white text-xl" />}
            color="bg-[#E100FF]/20"
          />
          <StatCard
            title="Total Sales"
            value={stats?.totalSales || 0}
            icon={<FaShoppingCart className="text-white text-xl" />}
            color="bg-[#7ED7FF]/20"
          />
          <StatCard
            title="Total Views"
            value={stats?.totalViews || 0}
            icon={<FaEye className="text-white text-xl" />}
            color="bg-[#FF6B35]/20"
          />
          <StatCard
            title="Total Plays"
            value={stats?.totalPlays || 0}
            icon={<FaPlay className="text-white text-xl" />}
            color="bg-green-500/20"
          />
        </div>

        {/* Earnings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FaDollarSign className="text-[#E100FF]" />
              Earnings Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-white">
                  ${stats?.totalEarnings?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FaCheckCircle className="text-green-400 text-sm" />
                  <p className="text-gray-400 text-sm">Available</p>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  ${stats?.availableBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FaClock className="text-yellow-400 text-sm" />
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
                <p className="text-3xl font-bold text-yellow-400">
                  ${stats?.pendingBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              * Earnings become available 7 days after purchase
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
            <h2 className="text-xl font-bold text-white mb-4">Platform Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="text-white font-semibold">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Share</span>
                <span className="text-green-400 font-semibold">85%</span>
              </div>
              <div className="border-t border-[#232B43] my-4"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">License Types</span>
                <span className="text-white font-semibold">3</span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Personal: 1x base price</p>
                <p>• Commercial: 2.5x base price</p>
                <p>• Exclusive: 10x base price</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickAction
              title="Upload Track"
              description="Upload a new track to sell"
              icon={<FaUpload className="text-white text-lg" />}
              color="bg-[#E100FF]/20"
              onClick={() => router.push('/user/pages/Upload')}
            />
            <QuickAction
              title="My Tracks"
              description="Manage your uploaded tracks"
              icon={<FaList className="text-white text-lg" />}
              color="bg-[#7ED7FF]/20"
              onClick={() => router.push('/user/pages/MyTracks')}
            />
            <QuickAction
              title="View Sales"
              description="See your sales history"
              icon={<FaChartLine className="text-white text-lg" />}
              color="bg-[#FF6B35]/20"
              onClick={() => router.push('/user/pages/MySales')}
            />
            <QuickAction
              title="Marketplace"
              description="Browse the marketplace"
              icon={<FaShoppingCart className="text-white text-lg" />}
              color="bg-green-500/20"
              onClick={() => router.push('/user/pages/Marketplace')}
            />
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-[#E100FF]" />
            Recent Sales
          </h2>
          
          {stats?.recentSales && stats.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#232B43]">
                    <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Track</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Buyer</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">License</th>
                    <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Amount</th>
                    <th className="text-right text-gray-400 text-sm font-medium py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map((sale: any, index: number) => (
                    <tr key={index} className="border-b border-[#232B43]/50 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {sale.tracks?.trackImage && (
                            <img 
                              src={sale.tracks.trackImage} 
                              alt="" 
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <span className="text-white">{sale.tracks?.trackName || 'Unknown Track'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {sale.buyer?.firstName} {sale.buyer?.lastName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sale.licenseType === 'exclusive' ? 'bg-[#E100FF]/20 text-[#E100FF]' :
                          sale.licenseType === 'commercial' ? 'bg-[#7ED7FF]/20 text-[#7ED7FF]' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {sale.licenseType?.charAt(0).toUpperCase() + sale.licenseType?.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-green-400 font-semibold">
                        ${sale.sellerEarnings?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400 text-sm">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaChartLine className="text-gray-600 text-4xl mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">No Sales Yet</h3>
              <p className="text-gray-400 mb-4">Upload tracks and start selling to see your sales here.</p>
              <button
                onClick={() => router.push('/user/pages/Upload')}
                className="bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Upload Your First Track
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}