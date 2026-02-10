'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paypalAPI } from '../../utils/api';
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaPaypal, FaEdit, FaTrash, FaTimes, FaExclamationTriangle, FaCloudUploadAlt } from 'react-icons/fa';

interface PayPalConnectProps {
    userId: string;
    onStatusChange?: (status: any) => void;
}

// Confirmation Modal Component
const ConfirmModal = ({
    isOpen,
    onConfirm,
    onCancel,
    loading
}: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            
            {/* Modal */}
            <div className="relative bg-[#101936] border border-[#232B43] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-400 text-2xl" />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-white text-xl font-semibold text-center mb-2">
                    Disconnect PayPal?
                </h3>
                <p className="text-gray-400 text-center text-sm mb-6">
                    You won't be able to receive payments for track sales until you reconnect a PayPal account. Any pending payouts will still be processed.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-[#1a1f35] border border-[#232B43] hover:border-white/30 text-white rounded-xl font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaTrash className="text-sm" />
                                Disconnect
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

function PayPalConnectSection({ userId, onStatusChange }: PayPalConnectProps) {
    const router = useRouter();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [paypalEmail, setPaypalEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [justConnected, setJustConnected] = useState(false);

    useEffect(() => {
        checkPayPalStatus();
    }, [userId]);

    const checkPayPalStatus = async () => {
        try {
            setLoading(true);
            const response = await paypalAPI.getStatus(userId);
            setStatus(response);
            if (response.paypalEmail) {
                setPaypalEmail(response.paypalEmail);
            }
            if (onStatusChange) onStatusChange(response);
        } catch (error) {
            console.error('Error checking PayPal status:', error);
            setStatus({ connected: false });
        } finally {
            setLoading(false);
        }
    };

    const handleConnectPayPal = async () => {
        if (!paypalEmail.trim()) {
            setError('Please enter your PayPal email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(paypalEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setActionLoading(true);
            setError('');

            if (status?.connected) {
                await paypalAPI.update(userId, paypalEmail);
            } else {
                await paypalAPI.connect(userId, paypalEmail);
            }

            await checkPayPalStatus();
            setIsEditing(false);
            setJustConnected(true);
        } catch (error) {
            console.error('Error connecting PayPal:', error);
            setError('Failed to save PayPal email. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setActionLoading(true);
            await paypalAPI.disconnect(userId);
            setPaypalEmail('');
            setShowConfirmModal(false);
            setJustConnected(false);
            await checkPayPalStatus();
        } catch (error) {
            console.error('Error disconnecting PayPal:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-white" />
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={handleDisconnect}
                onCancel={() => setShowConfirmModal(false)}
                loading={actionLoading}
            />

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3 mb-4">
                    <FaPaypal className="text-3xl text-[#00457C]" />
                    <h2 className="text-xl font-semibold text-white">PayPal Payouts</h2>
                </div>

                {!status?.connected || isEditing ? (
                    // Not connected or editing
                    <div>
                        <p className="text-gray-300 mb-4">
                            {isEditing 
                                ? 'Update your PayPal email address:' 
                                : 'Enter your PayPal email to receive payments when your tracks are sold.'}
                        </p>

                        <div className="space-y-3">
                            <input
                                type="email"
                                value={paypalEmail}
                                onChange={(e) => {
                                    setPaypalEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="your-paypal@email.com"
                                className="w-full px-4 py-3 bg-[#0A1428] border border-[#232B43] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0070BA]"
                            />

                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleConnectPayPal}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 px-4 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    {actionLoading ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <>
                                            <FaPaypal />
                                            <span>{isEditing ? 'Update' : 'Connect PayPal'}</span>
                                        </>
                                    )}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setPaypalEmail(status?.paypalEmail || '');
                                            setError('');
                                        }}
                                        className="py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-200 text-sm">
                                💡 Use the email address associated with your PayPal account. 
                                Earnings will be sent directly to this PayPal account after each sale.
                            </p>
                        </div>
                    </div>
                ) : (
                    // Connected
                    <div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-2">
                                <FaCheckCircle className="text-green-400 mt-1" />
                                <div>
                                    <p className="text-green-200 font-medium">PayPal Connected</p>
                                    <p className="text-green-200/80 text-sm mt-1">
                                        Earnings will be sent to: <strong>{status.paypalEmail}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Go to Upload button - shown after just connecting */}
                        {justConnected && (
                            <button
                                onClick={() => router.push('/user/pages/Upload')}
                                className="w-full py-3 px-4 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                            >
                                <FaCloudUploadAlt className="text-lg" />
                                <span>Go to Upload Page</span>
                            </button>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                disabled={actionLoading}
                                className="flex-1 py-3 px-4 bg-[#0070BA] hover:bg-[#005ea6] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                                <FaEdit />
                                <span>Change Email</span>
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={actionLoading}
                                className="py-3 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                )}

                {/* Fee Structure Info */}
                <div className="mt-6 pt-6 border-t border-white/20">
                    <h3 className="text-white font-medium mb-3">Fee Structure</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                            <span>Platform Fee</span>
                            <span>15%</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                            <span>You Receive</span>
                            <span className="text-green-400 font-medium">85%</span>
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-3">
                        Example: If you sell a track for $100, you receive $85 directly to your PayPal account.
                    </p>
                </div>
            </div>
        </>
    );
}

export default PayPalConnectSection;