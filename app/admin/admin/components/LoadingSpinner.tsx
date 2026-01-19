import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#232B43] border-t-[#E100FF] rounded-full animate-spin"></div>
        <div className="text-white text-sm">Loading dashboard...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
