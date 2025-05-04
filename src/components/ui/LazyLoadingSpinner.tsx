import React from 'react';

const LazyLoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      <p className="ml-3 text-gray-600">Loading...</p>
    </div>
  );
};

export default LazyLoadingSpinner;
