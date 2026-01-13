'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { 
  FaMusic, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaPlus,
  FaChartLine,
  FaPlay,
  FaDollarSign,
  FaSearch,
  FaFilter
} from 'react-icons/fa'

interface Track {
  id: string;
  trackName: string;
  trackId: string;
  trackImage: string;
  trackPrice: number;
  trackType: string;
  bpm: number;
  trackKey: string;
  publish: string;
  salesCount: number;
  viewCount: number;
  playCount: number;
  createdAt: string;
}

export default function MyTracks() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchMyTracks(parsedUser.id);
  }, [router]);

  const fetchMyTracks = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/user-tracks/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setTracks(data.tracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (track: Track) => {
    try {
      const newStatus = track.publish === 'Public' ? 'Private' : 'Public';
      const response = await fetch(`http://localhost:3001/api/tracks/${track.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, publish: newStatus } : t
        ));
      }
    } catch (error) {
      console.error('Error updating track:', error);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
      return;
    }

    setDeletingId(trackId);
    try {
      const response = await fetch(`http://localhost:3001/api/tracks/${trackId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
      } else {
        alert(data.message || 'Failed to delete track');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Failed to delete track');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditTrack = (track: Track) => {
    localStorage.setItem('editTrackData', JSON.stringify(track));
    router.push('/admin/tracks/add?mode=edit');
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.trackName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || track.publish.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tracks.length,
    public: tracks.filter(t => t.publish === 'Public').length,
    private: tracks.filter(t => t.publish === 'Private').length,
    totalSales: tracks.reduce((sum, t) => sum + (t.salesCount || 0), 0),
    totalViews: tracks.reduce((sum, t) => sum + (t.viewCount || 0), 0)
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

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Tracks</h1>
            <p className="text-gray-400">Manage your uploaded tracks</p>
          </div>
          <button
            onClick={() => router.push('/user/pages/Upload')}
            className="flex items-center gap-2 bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FaPlus />
            Upload New Track
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Tracks</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Public</p>
            <p className="text-2xl font-bold text-green-400">{stats.public}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Private</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.private}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-[#E100FF]">{stats.totalSales}</p>
          </div>
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43]">
            <p className="text-gray-400 text-sm mb-1">Total Views</p>
            <p className="text-2xl font-bold text-[#7ED7FF]">{stats.totalViews}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl p-4 border border-[#232B43] mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks..."
                className="w-full bg-[#0A1428] border border-[#232B43] rounded-lg pl-12 pr-4 py-2.5 text-white focus:border-[#E100FF] focus:outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A1428] border border-[#232B43] rounded-lg px-4 py-2.5 text-white focus:border-[#E100FF] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        {/* Tracks List */}
        {filteredTracks.length > 0 ? (
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl border border-[#232B43] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#232B43]">
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-6">Track</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">Type</th>
                    <th className="text-left text-gray-400 text-sm font-medium py-4 px-4">Price</th>
                    <th className="text-center text-gray-400 text-sm font-medium py-4 px-4">Status</th>
                    <th className="text-center text-gray-400 text-sm font-medium py-4 px-4">Stats</th>
                    <th className="text-right text-gray-400 text-sm font-medium py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map(track => (
                    <tr key={track.id} className="border-b border-[#232B43]/50 hover:bg-white/5">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={track.trackImage || '/default-track.jpg'} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-white font-medium">{track.trackName}</p>
                            <p className="text-gray-500 text-sm">
                              {track.bpm && `${track.bpm} BPM`}
                              {track.trackKey && ` • ${track.trackKey}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300 text-sm">{track.trackType}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-semibold">${track.trackPrice}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(track)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            track.publish === 'Public'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          }`}
                        >
                          {track.publish === 'Public' ? <FaEye /> : <FaEyeSlash />}
                          {track.publish}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaEye /> {track.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaPlay /> {track.playCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaDollarSign /> {track.salesCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/user/pages/Track/${track.id}`)}
                            className="p-2 bg-[#232B43] hover:bg-[#232B43]/80 text-white rounded-lg transition-colors"
                            title="View"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditTrack(track)}
                            className="p-2 bg-[#7ED7FF]/20 hover:bg-[#7ED7FF]/30 text-[#7ED7FF] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrack(track.id)}
                            disabled={deletingId === track.id}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === track.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl border border-[#232B43]">
            <FaMusic className="text-gray-600 text-5xl mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No Tracks Found' : 'No Tracks Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Upload your first track and start selling'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => router.push('/user/pages/Upload')}
                className="bg-[#E100FF] hover:bg-[#E100FF]/80 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <FaPlus />
                Upload Your First Track
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}