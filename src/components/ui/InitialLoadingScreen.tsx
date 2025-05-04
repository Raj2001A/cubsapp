import React from 'react';

const InitialLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading Application</h2>
        <p className="mt-2 text-gray-500">Please wait while we prepare your experience...</p>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;
