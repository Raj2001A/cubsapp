import React from 'react';
import { LoadingFallback } from './LoadingFallback';

interface SafeSuspenseProps {
  children: React.ReactNode;
}

export const SafeSuspense: React.FC<SafeSuspenseProps> = ({ children }) => {
  return (
    <React.Suspense fallback={<LoadingFallback />}>
      {children}
    </React.Suspense>
  );
};
