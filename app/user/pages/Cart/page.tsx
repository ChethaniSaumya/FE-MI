'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  FaShoppingCart,
  FaTrash,
  FaLock,
  FaCheck,
  FaMusic,
  FaSpinner,
  FaPaypal
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

export default function Cart() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/user/pages/SignIn');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchCart(parsedUser.id);
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

  const formatPrice = (priceUSD: number) => {
    return `$${priceUSD.toFixed(2)}`;
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
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
          items
        })
      });

      const data = await response.json();

      if (data.success && data.url) {
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
                                Personal (${(item.track?.trackPrice || 0).toFixed(2)})
                              </option>
                              <option value="commercial">
                                Commercial (${((item.track?.trackPrice || 0) * 2.5).toFixed(2)})
                              </option>
                              <option value="exclusive">
                                Exclusive (${((item.track?.trackPrice || 0) * 10).toFixed(2)})
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
                            ${item.price.toFixed(2)}
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

                {/* Payment Method - PayPal */}
                <div className="mb-6 p-4 bg-[#0A1428] rounded-xl border border-[#232B43]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-medium">Payment Method</span>
                  </div>
                  <div className="flex items-center gap-3 py-2 px-3 bg-[#0070BA]/10 border border-[#0070BA]/30 rounded-lg">
                    <FaPaypal className="text-[#0070BA] text-xl" />
                    <span className="text-[#0070BA] font-medium">PayPal</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    You'll be redirected to PayPal to complete your purchase securely.
                  </p>
                </div>

                {/* Summary Lines */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="text-white">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform Fee (15%)</span>
                    <span className="text-white">Included</span>
                  </div>
                  <div className="border-t border-[#232B43] pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-2xl font-bold text-white">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-4 rounded-xl font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 bg-[#0070BA] text-white hover:bg-[#005ea6]"
                >
                  {processing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock />
                      Pay with PayPal — ${cart.total.toFixed(2)}
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <FaLock />
                  <span>Secure checkout powered by PayPal</span>
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