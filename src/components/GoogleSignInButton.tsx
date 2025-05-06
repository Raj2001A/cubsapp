import React from 'react';
import authService from '../services/authService';

/**
 * GoogleSignInButton Component
 * Provides a button that triggers Google OAuth sign-in using Firebase Auth.
 * 
 * Usage:
 * <GoogleSignInButton />
 */
export const GoogleSignInButton: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
      // Optionally, redirect or show a success toast here
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      alert(`Google sign-in failed: ${message}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition font-medium text-gray-700"
      aria-label="Sign in with Google"
    >
      <img src="/google.svg" alt="Google logo" className="h-5 w-5" />
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;
