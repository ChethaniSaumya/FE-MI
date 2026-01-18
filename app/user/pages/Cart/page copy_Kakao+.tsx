'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  FaShoppingCart,
  FaTrash,
  FaCreditCard,
  FaLock,
  FaCheck,
  FaMusic,
  FaSpinner,
  FaGlobe
} from 'react-icons/fa'

interface CartItem {
  id: string;
  licenseType: string;
  price: number;
  track: {
    id: string;
    trackName: string;
    trackImage: string;
    trackPrice: number;
    musician: string;
    musicianProfilePicture: string;
  };
}

interface CartData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  platformFee: number;
  total: number;
}

const LICENSE_INFO: Record<string, { name: string; color: string }> = {
  personal: { name: 'Personal', color: 'bg-green-500/20 text-green-400' },
  commercial: { name: 'Commercial', color: 'bg-[#7ED7FF]/20 text-[#7ED7FF]' },
  exclusive: { name: 'Exclusive', color: 'bg-[#E100FF]/20 text-[#E100FF]' }
};

// Payment methods by currency
const PAYMENT_METHODS_BY_CURRENCY: Record<string, string[]> = {
  usd: ['Credit/Debit Card'],
  krw: ['Kakao Pay', 'Naver Pay', 'Samsung Pay', 'PAYCO', 'Korean Cards', 'Credit/Debit Card']
};

// Exchange rate (you can make this dynamic via API)
const USD_TO_KRW_RATE = 1450;

export default function Cart() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  // Currency state for Kakao Pay support
  const [currency, setCurrency] = useState<'usd' | 'krw'>('usd');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchCart(parsedUser.id);
    
    // Auto-detect Korean users based on browser language
    const browserLang = navigator.language || '';
    if (browserLang.toLowerCase().startsWith('ko')) {
      setCurrency('krw');
    }
  }, [router]);

  const fetchCart = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/cart/${userId}`);
      const data = await response.json();

      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], itemCount: 0, subtotal: 0, platformFee: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Format price based on selected currency
  const formatPrice = (priceUSD: number) => {
    if (currency === 'krw') {
      const priceKRW = Math.round(priceUSD * USD_TO_KRW_RATE);
      return `₩${priceKRW.toLocaleString()}`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  // Get price in selected currency (for display in dropdowns)
  const getPriceInCurrency = (priceUSD: number) => {
    if (currency === 'krw') {
      return Math.round(priceUSD * USD_TO_KRW_RATE);
    }
    return priceUSD;
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        // Refresh cart
        if (user) fetchCart(user.id);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateLicense = async (itemId: string, licenseType: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseType })
      });

      const data = await response.json();
      if (data.success && user) {
        fetchCart(user.id);
      }
    } catch (error) {
      console.error('Error updating license:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user || !cart || cart.items.length === 0) return;

    setProcessing(true);
    try {
      const items = cart.items.map(item => ({
        trackId: item.track.id,
        licenseType: item.licenseType
      }));

      const response = await fetch('http://localhost:3001/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items,
          currency: currency  // Pass selected currency for Kakao Pay
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
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

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FaShoppingCart className="text-[#E100FF]" />
            Shopping Cart
          </h1>
          <p className="text-gray-400">
            {cart?.itemCount || 0} {cart?.itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cart && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl border border-[#232B43] overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Track Image */}
                    <div className="sm:w-32 aspect-square sm:aspect-auto flex-shrink-0">
                      <img
                        src={item.track?.trackImage || '/default-track.jpg'}
                        alt={item.track?.trackName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-white mb-1 cursor-pointer hover:text-[#E100FF] transition-colors"
                            onClick={() => router.push(`/user/pages/Track/${item.track?.id}`)}
                          >
                            {item.track?.trackName}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            {item.track?.musicianProfilePicture && (
                              <img
                                src={item.track.musicianProfilePicture}
                                alt=""
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            )}
                            <span className="text-gray-400 text-sm">{item.track?.musician}</span>
                          </div>

                          {/* License Selector */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-400 text-sm">License:</span>
                            <select
                              value={item.licenseType}
                              onChange={(e) => handleUpdateLicense(item.id, e.target.value)}
                              className="bg-[#0A1428] border border-[#232B43] rounded-lg px-3 py-1.5 text-white text-sm focus:border-[#E100FF] focus:outline-none"
                            >
                              <option value="personal">
                                Personal ({formatPrice(item.track?.trackPrice || 0)})
                              </option>
                              <option value="commercial">
                                Commercial ({formatPrice((item.track?.trackPrice || 0) * 2.5)})
                              </option>
                              <option value="exclusive">
                                Exclusive ({formatPrice((item.track?.trackPrice || 0) * 10)})
                              </option>
                            </select>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${LICENSE_INFO[item.licenseType]?.color || ''}`}>
                              {LICENSE_INFO[item.licenseType]?.name || item.licenseType}
                            </span>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-4">
                          <p className="text-xl font-bold text-white">
                            {formatPrice(item.price)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingId === item.id}
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                          >
                            {removingId === item.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Continue Shopping */}
              <button
                onClick={() => router.push('/user/pages/Marketplace')}
                className="text-[#E100FF] hover:underline text-sm"
              >
                ← Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-xl border border-[#232B43] p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                {/* Currency Selector */}
                <div className="mb-6 p-4 bg-[#0A1428] rounded-xl border border-[#232B43]">
                  <div className="flex items-center gap-2 mb-3">
                    <FaGlobe className="text-[#E100FF]" />
                    <span className="text-white font-medium">Select Currency</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrency('usd')}
                      className={`py-3 px-4 rounded-lg border transition-all text-center ${
                        currency === 'usd'
                          ? 'bg-[#E100FF]/20 border-[#E100FF] text-white'
                          : 'bg-[#101936] border-[#232B43] text-gray-400 hover:border-[#E100FF]/50'
                      }`}
                    >
                      <div className="text-lg font-bold">$ USD</div>
                      <div className="text-xs mt-0.5 opacity-70">US Dollar</div>
                    </button>
                    <button
                      onClick={() => setCurrency('krw')}
                      className={`py-3 px-4 rounded-lg border transition-all text-center ${
                        currency === 'krw'
                          ? 'bg-[#E100FF]/20 border-[#E100FF] text-white'
                          : 'bg-[#101936] border-[#232B43] text-gray-400 hover:border-[#E100FF]/50'
                      }`}
                    >
                      <div className="text-lg font-bold">₩ KRW</div>
                      <div className="text-xs mt-0.5 opacity-70">Korean Won</div>
                    </button>
                  </div>
                  
                  {/* Available Payment Methods */}
                  <div className="mt-3 pt-3 border-t border-[#232B43]">
                    <p className="text-gray-500 text-xs mb-2">Available payment methods:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {PAYMENT_METHODS_BY_CURRENCY[currency].map((method) => (
                        <span 
                          key={method}
                          className="px-2 py-1 bg-[#101936] rounded text-xs text-gray-300"
                        >
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* KRW Notice */}
                  {currency === 'krw' && (
                    <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-xs">
                        🇰🇷 카카오페이, 네이버페이로 결제하세요!
                      </p>
                      <p className="text-yellow-400/70 text-xs mt-1">
                        Rate: $1 = ₩{USD_TO_KRW_RATE.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary Lines */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="text-white">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform Fee (15%)</span>
                    <span className="text-white">Included</span>
                  </div>
                  <div className="border-t border-[#232B43] pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{formatPrice(cart.total)}</span>
                        {currency === 'krw' && (
                          <p className="text-gray-500 text-xs mt-1">(${cart.total.toFixed(2)} USD)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-[#E100FF] to-[#7C3AED] text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Pay {formatPrice(cart.total)}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <FaLock />
                  <span>
                    {currency === 'krw' 
                      ? 'Secure checkout via Kakao Pay / Stripe' 
                      : 'Secure checkout powered by Stripe'
                    }
                  </span>
                </div>

                {/* What You Get */}
                <div className="mt-6 pt-6 border-t border-[#232B43]">
                  <h3 className="text-white font-medium mb-3">What you'll get:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaCheck className="text-green-400 text-xs" />
                      Instant download access
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaCheck className="text-green-400 text-xs" />
                      License certificate
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaCheck className="text-green-400 text-xs" />
                      High-quality audio files
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaCheck className="text-green-400 text-xs" />
                      Lifetime access in library
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-20 bg-gradient-to-br from-[#101936] to-[#0A1428] rounded-2xl border border-[#232B43]">
            <FaMusic className="text-gray-600 text-5xl mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">Your Cart is Empty</h3>
            <p className="text-gray-400 mb-6">Discover amazing tracks and add them to your cart</p>
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