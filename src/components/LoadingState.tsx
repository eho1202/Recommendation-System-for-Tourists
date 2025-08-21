import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      <p className="mt-4 text-gray-600">Loading destination information just for you...</p>
    </div>
  );
};

export default LoadingState;