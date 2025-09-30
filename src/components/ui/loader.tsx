import React from 'react';

const Loader = ({ logoUrl, message }: { logoUrl: string, message: string }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="relative flex flex-col items-center justify-center">
        <img src={logoUrl} alt="NEXEN AIRIS Logo" className="w-24 h-24 mb-4 animate-pulse" />
        <p className="text-white text-lg font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
