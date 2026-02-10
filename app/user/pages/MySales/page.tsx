// ================================================================
// FIX #3: Create Missing MySales Page
// File: app/user/pages/MySales/page.tsx (CREATE THIS FILE)
// ================================================================

'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  FaChartLine,
  FaCheckCircle,
  FaMusic,
  FaDollarSign,
  FaCalendar,
  FaShoppingCart,
  FaArrowLeft
} from 'react-icons/fa'

interface Sale {
  id: string;
  trackName: string;
  buyer: string;
  licenseType: string;
  basePrice: number;
  platformFee: number;
  sellerEarnings: number;
  status: string;
  createdAt: string;
  orderNumber: string;
}

export default function MySalesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSalesData(parsedUser.id);
    } else {
      router.push('/user/pages/SignIn');
    }
  }, []);

  const fetchSalesData = async (userId: string) => {
    try {
      setLoading(true);
      
      // Use the same endpoint as CreatorDashboard for consistency
      const response = await fetch(`http://localhost:3001/api/creator/stats/${userId}`);
      const data = await response.json();

      if (data.success) {
        const recentSales = data.stats?.recentSales || [];
        setSales(recentSales);
        
        // Use the same totalEarnings calculation from creator stats
        const total = data.stats?.totalSales || 0;
        const earnings = data.stats?.totalEarnings || 0;

        setStats({
          totalSales: total,
          totalEarnings: earnings
        });
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081028]">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Sales</h1>
          <p className="text-gray-400">View your sales history and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#E100FF]/20 flex items-center justify-center">
                <FaShoppingCart className="text-[#E100FF]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white">{stats.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl p-6 border border-[#232B43]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FaDollarSign className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">After platform fees & transaction costs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl border border-[#232B43] overflow-hidden">
          <div className="p-6 border-b border-[#232B43]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChartLine className="text-[#E100FF]" />
              Sales History
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E100FF]"></div>
            </div>
          ) : sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0A1428]">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Track</th>
                    <th className="py-3 px-4">License</th>
                    <th className="py-3 px-4 text-right">Earnings</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-t border-[#232B43] hover:bg-[#0A1428]/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-gray-400">
                        {sale.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FaMusic className="text-[#E100FF]" />
                          <span>{sale.tracks?.trackName || 'Unknown Track'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sale.licenseType === 'personal' ? 'bg-[#E100FF]/20 text-[#E100FF]' :
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