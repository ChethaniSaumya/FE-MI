'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaCheckCircle } from 'react-icons/fa'

export default function PaymentSuccess() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to library after 3 seconds
        setTimeout(() => {
            router.push('/user/pages/MyLibrary');
        }, 3000);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#081028] flex items-center justify-center">
            <div className="text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-gray-400 mb-4">Your tracks are now in your library.</p>
                <p className="text-gray-500 text-sm">Redirecting to your library...</p>
            </div>
        </div>
    );
}