'use client'
import React from 'react';

interface PriceCalculatorProps {
    price: number;
    label?: string;
}

function PriceCalculator({ price, label = "Track Price" }: PriceCalculatorProps) {
    const platformFeePercent = 15;
    const platformFee = Math.round(price * (platformFeePercent / 100) * 100) / 100;
    const creatorEarnings = Math.round((price - platformFee) * 100) / 100;

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-2">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Earnings Breakdown</h4>
            
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white">${price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform Fee (15%)</span>
                    <span className="text-red-400">-${platformFee.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-white/10 pt-2 mt-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300 font-medium">You Earn</span>
                        <span className="text-green-400 font-bold text-lg">${creatorEarnings.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PriceCalculator;