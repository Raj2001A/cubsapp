import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  );
};
