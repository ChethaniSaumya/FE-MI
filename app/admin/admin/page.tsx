"use client";
import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaMusic, 
  FaHeadphones, 
  FaTags, 
  FaDrum, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaEye,
  FaDownload,
  FaStar,
  FaClock,
  FaCalendarAlt,
  FaDollarSign,
  FaHeart,
  FaSync,
  FaBell
} from 'react-icons/fa';
import { userAPI, trackAPI, soundKitAPI, genreAPI, beatAPI, tagAPI } from '../utils/api';
import LoadingSpinner from './components/LoadingSpinner';

interface DashboardData {
  totalUsers: number;
  totalTracks: number;
  totalSoundKits: number;
  totalGenres: number;
  totalBeats: number;
  totalTags: number;
  recentUsers: any[];
  recentTracks: any[];
  recentSoundKits: any[];
  topTracks: any[];
  topSoundKits: any[];
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    totalTracks: 0,
    totalSoundKits: 0,
    totalGenres: 0,
    totalBeats: 0,
    totalTags: 0,
    recentUsers: [],
    recentTracks: [],
    recentSoundKits: [],
    topTracks: [],
    topSoundKits: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch all dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      const [
        usersResponse,
        tracksResponse,
        // soundKitsResponse, // COMMENTED OUT - Sound Kits disabled
        genresResponse,
        beatsResponse,
        tagsResponse
      ] = await Promise.all([
        userAPI.getUsers(),
        trackAPI.getTracks(),
        // soundKitAPI.getSoundKits(), // COMMENTED OUT - Sound Kits disabled
        genreAPI.getGenres(),
        beatAPI.getBeats(),
        tagAPI.getTags()
      ]);

      // Process data
      const users = usersResponse.success ? usersResponse.users : [];
      const tracks = tracksResponse.success ? tracksResponse.tracks : [];
      // const soundKits = soundKitsResponse.success ? soundKitsResponse.soundKits : []; // COMMENTED OUT
      const soundKits: any[] = []; // Empty array for now
      const genres = genresResponse.success ? genresResponse.genres : [];
      const beats = beatsResponse.success ? beatsResponse.beats : [];
      const tags = tagsResponse.success ? tagsResponse.tags : [];


      // Get recent items (last 5)
      const recentUsers = users.slice(-5).reverse();
      const recentTracks = tracks.slice(-5).reverse();
      const recentSoundKits = soundKits.slice(-5).reverse();

      // Mock top items (in real app, this would be based on sales/views)
      const topTracks = tracks.slice(0, 3).map((track: any) => ({
        ...track,
        views: Math.floor(Math.random() * 10000) + 1000,
        likes: Math.floor(Math.random() * 500) + 50,
        downloads: Math.floor(Math.random() * 200) + 20
      }));

      const topSoundKits = soundKits.slice(0, 3).map((kit: any) => ({
        ...kit,
        sales: Math.floor(Math.random() * 100) + 10,
        revenue: Math.floor(Math.random() * 1000) + 100
      }));

      setData({
        totalUsers: users.length,
        totalTracks: tracks.length,
        totalSoundKits: soundKits.length,
        totalGenres: genres.length,
        totalBeats: beats.length,
        totalTags: tags.length,
        recentUsers,
        recentTracks,
        recentSoundKits,
        topTracks,
        topSoundKits
      });

      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // KPI Card Component
  const KPICard = ({ title, value, icon, trend, trendValue, color }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
  }) => (
    <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 shadow-xl border border-[#232B43] hover:border-[#E100FF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#E100FF]/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
    </div>
  );


  // Recent Item Card
  const RecentItemCard = ({ item, type }: { item: any; type: 'user' | 'track' | 'soundkit' }) => (
    <div className="bg-[#101936] rounded-xl p-4 border border-[#232B43] hover:border-[#E100FF] transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {type === 'user' ? 'U' : type === 'track' ? 'T' : 'S'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">
            {type === 'user' 
              ? `${item.firstName} ${item.lastName}`
              : type === 'track'
              ? item.trackName
              : item.kitName
            }
          </div>
          <div className="text-gray-400 text-sm truncate">
            {type === 'user' 
              ? item.email
              : type === 'track'
              ? item.musician || 'Unknown Artist'
              : item.producer || 'Unknown Producer'
            }
          </div>
        </div>
        <div className="text-gray-400 text-xs">
          <FaClock className="inline mr-1" />
          {new Date(item.createdAt || Date.now()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  // Top Item Card
  const TopItemCard = ({ item, type, rank }: { item: any; type: 'track' | 'soundkit'; rank: number }) => (
    <div className="bg-[#101936] rounded-xl p-4 border border-[#232B43] hover:border-[#E100FF] transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {type === 'track' ? 'T' : 'S'}
            </span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#E100FF] flex items-center justify-center">
            <span className="text-white text-xs font-bold">#{rank}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold truncate">
            {type === 'track' ? item.trackName : item.kitName}
          </div>
          <div className="text-gray-400 text-sm truncate">
            {type === 'track' ? item.musician || 'Unknown Artist' : item.producer || 'Unknown Producer'}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs">
            {type === 'track' ? (
              <>
                <span className="text-gray-400 flex items-center gap-1">
                  <FaEye /> {item.views?.toLocaleString() || 0}
                </span>
                {/*<span className="text-gray-400 flex items-center gap-1">
                  <FaHeart /> {item.likes?.toLocaleString() || 0}
                </span>*/}
                <span className="text-gray-400 flex items-center gap-1">
                  <FaDownload /> {item.downloads?.toLocaleString() || 0}
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-400 flex items-center gap-1">
                  <FaDollarSign /> ${item.revenue?.toLocaleString() || 0}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <FaChartLine /> {item.sales?.toLocaleString() || 0} sales
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8">
        <LoadingSpinner />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening with your music platform.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-gray-400 text-sm">Last updated</div>
              <div className="text-white text-sm font-medium">
                {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={`text-white ${refreshing ? 'animate-spin' : ''}`} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - Sound Kits card hidden */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 mb-8">
        <KPICard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          icon={<FaUsers size={24} />}
          trend="up"
          trendValue="+12%"
          color="bg-blue-500/20 text-blue-400"
        />
        <KPICard
          title="Total Tracks"
          value={data.totalTracks.toLocaleString()}
          icon={<FaMusic size={24} />}
          trend="up"
          trendValue="+8%"
          color="bg-green-500/20 text-green-400"
        />
        {/* Sound Kits KPI - HIDDEN */}
        {/* <KPICard
          title="Sound Kits"
          value={data.totalSoundKits.toLocaleString()}
          icon={<FaHeadphones size={24} />}
          trend="up"
          trendValue="+15%"
          color="bg-purple-500/20 text-purple-400"
        /> */}
        <KPICard
          title="Genres"
          value={data.totalGenres.toLocaleString()}
          icon={<FaTags size={24} />}
          color="bg-orange-500/20 text-orange-400"
        />
        {/*<KPICard
          title="Beats"
          value={data.totalBeats.toLocaleString()}
          icon={<FaDrum size={24} />}
          color="bg-red-500/20 text-red-400"
        />
        <KPICard
          title="Tags"
          value={data.totalTags.toLocaleString()}
          icon={<FaTags size={24} />}
          color="bg-indigo-500/20 text-indigo-400"
        />*/}
      </div>


      {/* Recent Activity - Sound Kits section hidden */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Recent Users */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 shadow-xl border border-[#232B43]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Users</h3>
            <FaUsers className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.recentUsers.length > 0 ? (
              data.recentUsers.map((user, index) => (
                <RecentItemCard key={user.id || index} item={user} type="user" />
              ))
            ) : (
              <div className="text-center py-8">
                <FaUsers className="text-gray-400 mx-auto mb-2" size={32} />
                <div className="text-gray-400 text-sm">No users found</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tracks */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 shadow-xl border border-[#232B43]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Tracks</h3>
            <FaMusic className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.recentTracks.length > 0 ? (
              data.recentTracks.map((track, index) => (
                <RecentItemCard key={track.id || index} item={track} type="track" />
              ))
            ) : (
              <div className="text-center py-8">
                <FaMusic className="text-gray-400 mx-auto mb-2" size={32} />
                <div className="text-gray-400 text-sm">No tracks found</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sound Kits - HIDDEN */}
        {/* <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 shadow-xl border border-[#232B43]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Sound Kits</h3>
            <FaHeadphones className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {data.recentSoundKits.length > 0 ? (
              data.recentSoundKits.map((kit, index) => (
                <RecentItemCard key={kit.id || index} item={kit} type="soundkit" />
              ))
            ) : (
              <div className="text-center py-8">
                <FaHeadphones className="text-gray-400 mx-auto mb-2" size={32} />
                <div className="text-gray-400 text-sm">No sound kits found</div>
              </div>
            )}
          </div>
        </div> */}
      </div>
 
    </main>
  );
};

export default Dashboard;