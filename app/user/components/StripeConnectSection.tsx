'use client'
import React, { useState, useEffect } from 'react';
import { stripeConnectAPI } from '../../utils/api';
import { FaStripe, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

interface StripeConnectProps {
    userId: string;
}

function StripeConnectSection({ userId }: StripeConnectProps) {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkStripeStatus();
    }, [userId]);

    const checkStripeStatus = async () => {
        try {
            setLoading(true);
            const response = await stripeConnectAPI.getStatus(userId);
            setStatus(response);
        } catch (error) {
            console.error('Error checking Stripe status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectStripe = async () => {
        try {
            setActionLoading(true);
            
            // Create account if not exists
            if (!status?.connected) {
                await stripeConnectAPI.createAccount(userId);
            }
            
            // Get onboarding link
            const response = await stripeConnectAPI.getOnboardingLink(userId);
            
            if (response.success && response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Error connecting Stripe:', error);
            alert('Failed to connect Stripe. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenDashboard = async () => {
        try {
            setActionLoading(true);
            const response = await stripeConnectAPI.getDashboardLink(userId);
            
            if (response.success && response.url) {
                window.open(response.url, '_blank');
            }
        } catch (error) {
            console.error('Error opening dashboard:', error);
            alert('Failed to open Stripe dashboard.');
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
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-4">
                <FaStripe className="text-3xl text-[#635BFF]" />
                <h2 className="text-xl font-semibold text-white">Stripe Payouts</h2>
            </div>

            {!status?.connected ? (
                // Not connected
                <div>
                    <p className="text-gray-300 mb-4">
                        Connect your Stripe account to receive payments directly when your tracks are sold.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaExclamationCircle className="text-yellow-400 mt-1" />
                            <p className="text-yellow-200 text-sm">
                                You must connect a Stripe account before you can sell tracks. 
                                Earnings will be automatically transferred to your bank account.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <FaStripe className="text-xl" />
                                <span>Connect with Stripe</span>
                            </>
                        )}
                    </button>
                </div>
            ) : !status?.onboardingComplete ? (
                // Connected but onboarding incomplete
                <div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaExclamationCircle className="text-orange-400 mt-1" />
                            <div>
                                <p className="text-orange-200 font-medium">Onboarding Incomplete</p>
                                <p className="text-orange-200/80 text-sm mt-1">
                                    Please complete your Stripe account setup to start receiving payments.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleConnectStripe}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <span>Complete Setup</span>
                        )}
                    </button>
                </div>
            ) : !status?.payoutsEnabled ? (
                // Onboarding complete but payouts not enabled
                <div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaSpinner className="text-blue-400 mt-1 animate-spin" />
                            <div>
                                <p className="text-blue-200 font-medium">Verification Pending</p>
                                <p className="text-blue-200/80 text-sm mt-1">
                                    Stripe is reviewing your account. This usually takes 1-2 business days.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenDashboard}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                        View Stripe Dashboard
                    </button>
                </div>
            ) : (
                // Fully connected and enabled
                <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                            <FaCheckCircle className="text-green-400 mt-1" />
                            <div>
                                <p className="text-green-200 font-medium">Payouts Enabled</p>
                                <p className="text-green-200/80 text-sm mt-1">
                                    Your Stripe account is fully set up. Earnings will be automatically transferred to your bank.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleOpenDashboard}
                        disabled={actionLoading}
                        className="w-full py-3 px-4 bg-[#635BFF] hover:bg-[#5851ea] text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        {actionLoading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <>
                                <span>Open Stripe Dashboard</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Pricing Info */}
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
                    Example: If you sell a track for $100, you receive $85 directly to your bank account.
                </p>
            </div>
        </div>
    );
}

export default StripeConnectSection;