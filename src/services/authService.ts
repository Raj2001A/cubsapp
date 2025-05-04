// Mock Authentication Service
import { handleApiError, logError } from '../utils/errorUtils';

// Mock user storage (simulates a database)
const mockUsers = [
  {
    uid: '1',
    email: 'admin@example.com',
    password: 'password123',
    displayName: 'Admin User',
    role: 'Administrator',
    photoURL: null
  },
  {
    uid: '2',
    email: 'employee@example.com',
    password: 'employee123',
    displayName: 'Test Employee',
    role: 'employee',
    photoURL: null
  }
];

// User interface
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'Administrator' | 'employee';
  photoURL?: string | null;
  employeeId?: string;
}

// Secure storage implementation for token and user data
const secureStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Get the authentication token
export const getAuthToken = (): string | null => {
  return secureStorage.getItem('auth_token');
};

// Set the authentication token
export const setAuthToken = (token: string): void => {
  secureStorage.setItem('auth_token', token);
};

// Remove the authentication token
export const removeAuthToken = (): void => {
  secureStorage.removeItem('auth_token');
};

// Get the current user from Firebase
export const getCurrentUser = (): User | null => {
  const userStr = secureStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Set the current user
export const setCurrentUser = (user: User): void => {
  secureStorage.setItem('user', JSON.stringify(user));
};

// Remove the current user
export const removeCurrentUser = (): void => {
  secureStorage.removeItem('user');
};

// Register a new user
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  additionalData?: {
    trade?: string;
    nationality?: string;
    mobileNumber?: string;
    homePhoneNumber?: string;
    companyId?: string;
    visaExpiryDate?: string;
    dateOfBirth?: string;
  }
): Promise<User> => {
  try {
    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser = {
      uid: `mock-${Date.now()}`,
      email,
      password, // In a real app, this would be hashed
      displayName,
      role: 'employee' as const, // Default role
      photoURL: null
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Generate token
    const token = `mock-token-${newUser.uid}-${Date.now()}`;
    setAuthToken(token);

    // Create user object (without password)
    const user: User = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      photoURL: newUser.photoURL
    };

    // If additional data is provided, simulate creating an employee record
    if (additionalData) {
      // In a real app, this would call the backend
      user.employeeId = `emp-${Date.now()}`;

      // Log the additional data for debugging
      console.log('Additional employee data:', {
        ...additionalData,
        userId: user.uid,
        email: user.email,
        name: user.displayName
      });
    }

    // Save user to local storage
    setCurrentUser(user);

    return user;
  } catch (error) {
    logError('Registration failed', String(error));
    throw handleApiError(String(error));
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Simulate Google sign-in with a default user
    const timestamp = Date.now();
    const googleUser: User = {
      uid: `google-${timestamp}`,
      email: `user.${timestamp}@gmail.com`,
      displayName: 'Google User',
      role: 'employee',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user'
    };

    // Generate token
    const token = `mock-google-token-${googleUser.uid}-${timestamp}`;
    setAuthToken(token);

    // Save user to local storage
    setCurrentUser(googleUser);

    return googleUser;
  } catch (error) {
    logError('Google sign-in failed', String(error));
    throw handleApiError(String(error));
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Find user in mock database
    const mockUser = mockUsers.find(user => user.email === email && user.password === password);
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = `mock-token-${mockUser.uid}-${Date.now()}`;
    setAuthToken(token);

    // Create user object (without password)
    const user: User = {
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      role: mockUser.role as 'Administrator' | 'employee',
      photoURL: mockUser.photoURL
    };

    // Save user to local storage
    setCurrentUser(user);

    return user;
  } catch (error) {
    logError('Login failed', String(error));
    throw handleApiError(String(error));
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Clear local storage
    removeAuthToken();
    removeCurrentUser();
  } catch (error) {
    logError('Logout failed', String(error));
    throw handleApiError(String(error));
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // Check if user exists
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      throw new Error('No user found with this email');
    }

    // In a real app, this would send a password reset email
    console.log(`[Mock Auth] Password reset email sent to ${email}`);
  } catch (error) {
    logError('Password reset failed', String(error));
    throw handleApiError(String(error));
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'Administrator';
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  // Initial call with current auth state
  const user = getCurrentUser();
  callback(user);

  // Listen for storage events to detect changes
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'user') {
      const user = event.newValue ? JSON.parse(event.newValue) as User : null;
      callback(user);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

import { employeeService } from './employeeService';

// Get employee details for the authenticated user
export const getEmployeeDetails = async (userId: string): Promise<any> => {
  try {
    // Use employeeService to fetch the employee details
    const employee = await employeeService.getById(userId);
    return {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      companyId: employee.companyId,
      documents: employee.documents
    };
  } catch (error) {
    console.error('Error fetching employee details:', error);
    throw error;
  }
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  registerUser,
  signInWithGoogle,
  loginUser,
  logout,
  resetPassword,
  isAuthenticated,
  isAdmin,
  onAuthStateChange,
  getEmployeeDetails
};