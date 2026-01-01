'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Cart = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#16213E] text-white">
      <Navbar />
      
      {/* Background Effects */}
      <div className='containerpaddin container mx-auto pt-34 sm:pt-28 md:pt-32 lg:pt-50 xl:pt-50'>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Under Construction Section */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/20 p-8 md:p-12">
              
              {/* Construction Icon */}
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#E100FF] to-[#7C3AED] rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
                </svg>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-[#E100FF] to-[#7C3AED] bg-clip-text text-transparent">
                Under Construction
              </h1>
              
              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                We're building something amazing for you!
              </p>
              
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Our shopping cart feature is currently under development. We're working hard to bring you the best music shopping experience. Please check back soon!
              </p>
              
              {/* Progress Bar */}
              <div className="mb-12">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#E100FF] to-[#7C3AED] h-2 rounded-full transition-all duration-1000"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
              
              {/* Features Coming Soon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#E100FF]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#E100FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Smart Cart</h3>
                  <p className="text-gray-400 text-sm">Intelligent cart management with recommendations</p>
                </div>
                
                <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#E100FF]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#E100FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Secure Payment</h3>
                  <p className="text-gray-400 text-sm">Multiple payment options with top security</p>
                </div>
                
                <div className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#E100FF]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#E100FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Instant Access</h3>
                  <p className="text-gray-400 text-sm">Immediate download after purchase</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/user/pages/home" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#E100FF] to-[#7C3AED] text-white rounded-lg hover:from-[#E100FF]/90 hover:to-[#7C3AED]/90 transition-all duration-300 font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </a>
                
                <a 
                  href="/user/pages/topcharts" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-lg hover:bg-white/10 hover:border-white/40 transition-all duration-300 font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  Browse Music
                </a>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;