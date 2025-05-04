import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContextType } from '../types/auth';
import { User } from '../types/user';
import { Employee } from '../types/employees';
import mockAuthService from '../services/mockAuthService';
import { useUI } from './UIContext';
import { OperationType, ErrorSeverity } from '../types/ui';

// Use mock auth service for development
const authService = mockAuthService;

// Create a secure storage utility
const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      // In a real app, you would use a more secure method like HttpOnly cookies
      // For this example, we'll use sessionStorage which is cleared when the browser is closed
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook to check if the current user is an admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'Administrator';
};

// Helper hook to check if the current user is an employee
export const useIsEmployee = () => {
  const { user } = useAuth();
  return user?.role === 'employee';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visaReminder, setVisaReminderState] = useState<boolean>(secureStorage.getItem('visaReminder') === 'true' || false);

  // Get UI context for loading and error handling
  const { setLoading, addError, showToast } = useUI();

  // Listen for auth state changes and fetch employee details
  useEffect(() => {
    let isMounted = true;
    
    // Temporary fix: Set a default authenticated state for development
    // This ensures the UI renders even if there are backend connection issues
    if (process.env.NODE_ENV === 'development') {
      setIsLoading(false);
      // Only set these if not already authenticated
      if (!isAuthenticated) {
        const defaultUser = {
          id: 'default-admin',
          name: 'CUBS Admin',
          email: 'admin@cubs.example.com',
          role: 'Administrator' as const
        };
        setUser(defaultUser);
        setIsAuthenticated(true);
        secureStorage.setItem('authUser', JSON.stringify(defaultUser));
      }
      return () => { isMounted = false; };
    }
    
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser: User | null) => {
      if (!isMounted) return;
      
      try {
        setUser(firebaseUser);
        setIsAuthenticated(!!firebaseUser);
        
        if (firebaseUser && firebaseUser.id) {
          // Fetch employee details only if user is authenticated and has an ID
          try {
            // Fetch employee details here if needed
            // For now, we'll just set loading to false
          } catch (error) {
            console.error('Error fetching employee details:', error);
            if (isMounted) {
              addError('Failed to fetch employee details', ErrorSeverity.WARNING);
            }
          }
        }
      } catch (error) {
        console.error('Error processing auth state change:', error);
        if (isMounted) {
          setError('Authentication error');
          addError('Authentication error', ErrorSeverity.ERROR);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });
    
    // Force isLoading to false after 2 seconds as a failsafe
    const timer = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log('Auth loading timeout reached, forcing UI to render');
        setIsLoading(false);
      }
    }, 2000);
    
    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, [addError, isLoading]);

  useEffect(() => {
    // Only update storage when visaReminder actually changes
    secureStorage.setItem('visaReminder', String(visaReminder));
  }, [visaReminder]); // Only depend on visaReminder

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setLoading(OperationType.AUTHENTICATION, true);

      // Use Firebase authentication with Google
      try {
        await authService.signInWithGoogle();
        return true;
      } catch (authError) {
        const error = authError instanceof Error ? authError : new Error('Authentication failed');
        setError(error.message);
        addError(
          'Google Sign-In Failed',
          ErrorSeverity.ERROR,
          OperationType.AUTHENTICATION,
          error.message
        );
        return false;
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      setError(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
      setLoading(OperationType.AUTHENTICATION, false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setLoading(OperationType.AUTHENTICATION, true);

      // Validate input
      if (!email || !password) {
        setError('Email and password are required');
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // For development, allow admin@example.com to bypass Firebase
      if (import.meta.env.DEV && email === 'admin@example.com' && password === 'password123') {
        // Generate a mock token
        const token = `mock-jwt-token-${Date.now()}`;

        // Store auth data
        secureStorage.setItem('auth_token', token);

        // Update state
        const adminUser: User = {
          id: 'admin-user',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Administrator',
        };

        setUser(adminUser);
        setIsAuthenticated(true);
        authService.setCurrentUser(adminUser);
        authService.setAuthToken(token);

        // Dispatch a custom event to notify other components
        const event = new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true }
        });
        window.dispatchEvent(event);

        // Show welcome message
        const userName = import.meta.env.DEV && email === 'admin@example.com' 
          ? 'Admin'
          : user?.name || email.split('@')[0];
        showToast(`Welcome back, ${userName}!`, 'success');
        return true;
      } else {
        try {
          const result = await authService.signInWithEmailAndPassword(email, password);
          const user = result.user;
          const userName = await authService.fetchUserName(user.uid);
          setUser(user);
          setIsAuthenticated(true);
          authService.setCurrentUser(user);
          showToast(`Welcome, ${userName}!`, 'success');
          return true;
        } catch (error: unknown) {
          const authError = error instanceof Error ? error : new Error('Authentication failed');
          setError(authError.message);
          addError(
            'Login Failed',
            ErrorSeverity.ERROR,
            OperationType.AUTHENTICATION,
            authError.message
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
      setLoading(OperationType.AUTHENTICATION, false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    additionalData?: {
      visaExpiryDate?: string;
      mobileNumber?: string;
      trade?: string;
      nationality?: string;
      homePhoneNumber?: string;
      companyId?: string;
      dateOfBirth?: string;
    }
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setLoading(OperationType.AUTHENTICATION, true);

      // Validate input
      if (!name || !email || !password) {
        setError('All fields are required');
        return false;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return false;
      }

      // Validate phone number if provided
      if (additionalData?.mobileNumber && !/^\+?[\d\s-()]+$/.test(additionalData.mobileNumber)) {
        setError('Please enter a valid phone number');
        return false;
      }

      // Validate visa expiry date if provided
      if (additionalData?.visaExpiryDate) {
        const expiryDate = new Date(additionalData.visaExpiryDate);
        const today = new Date();
        if (expiryDate < today) {
          setError('Visa expiry date cannot be in the past');
          return false;
        }
      }

      // Use Firebase to register the user
      try {
        await authService.registerUser(email, password, name, additionalData);

        showToast(`Welcome, ${name}! Your account has been created.`, 'success');
        return true;
      } catch (authError) {
        const error = authError instanceof Error ? authError : new Error('Authentication failed');
        setError(error.message);
        addError(
          'Registration Failed',
          ErrorSeverity.ERROR,
          OperationType.AUTHENTICATION,
          error.message
        );
        return false;
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
      setLoading(OperationType.AUTHENTICATION, false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(OperationType.AUTHENTICATION, true);

      // Use Firebase to sign out
      await authService.logout();

      // Clear local state
      setUser(null);
      setEmployeeDetails(null);
      setIsAuthenticated(false);

      // Show success message
      showToast('You have been logged out successfully', 'info');

      // Dispatch a custom event to notify other components
      const event = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Logout failed:', error);
      addError(
        'Logout Failed',
        ErrorSeverity.ERROR,
        OperationType.AUTHENTICATION,
        error instanceof Error ? error.message : 'Could not log out'
      );
    } finally {
      setLoading(OperationType.AUTHENTICATION, false);
    }
  };

  // Clear error function - make it stable with useCallback
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setVisaReminder = (reminder: boolean) => {
    setVisaReminderState(reminder);
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(OperationType.AUTHENTICATION, true);

      await authService.resetPassword(email);

      showToast(`Password reset email sent to ${email}`, 'success');
    } catch (error) {
      addError(
        'Password Reset Failed',
        ErrorSeverity.ERROR,
        OperationType.AUTHENTICATION,
        error instanceof Error ? error.message : 'Could not send password reset email'
      );
      throw error;
    } finally {
      setLoading(OperationType.AUTHENTICATION, false);
    }
  };

  // Memoize the context value to prevent unnecessary re-renders and loops
  const contextValue = useMemo(() => ({
    user,
    employeeDetails,
    isAuthenticated,
    isLoading,
    error,
    login,
    signInWithGoogle,
    logout,
    register,
    resetPassword,
    visaReminder,
    setVisaReminder,
    clearError,
  }), [
    user,
    employeeDetails,
    isAuthenticated,
    isLoading,
    error,
    login,
    signInWithGoogle,
    logout,
    register,
    resetPassword,
    visaReminder,
    setVisaReminder,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
