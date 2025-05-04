/**
 * Mock Authentication Service
 * 
 * This service provides mock authentication functionality for development.
 * It simulates user authentication without requiring Firebase or any external service.
 */

// Mock user storage (simulates a database)
const mockUsers = [
  {
    uid: '1',
    email: 'admin@example.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
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

// Local storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';

// Helper function to generate a mock token
const generateMockToken = (user) => {
  return `mock-token-${user.uid}-${Date.now()}`;
};

// Helper function to log errors
const logError = (message, error) => {
  console.error(`[Mock Auth] ${message}:`, error);
};

// Get auth token from local storage
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Set auth token in local storage
export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

// Remove auth token from local storage
export const removeAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

// Get current user from local storage
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Set current user in local storage
export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Remove current user from local storage
export const removeCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Register a new user
export const registerUser = async (name, email, password) => {
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
      displayName: name,
      role: 'employee',
      photoURL: null
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Generate token
    const token = generateMockToken(newUser);
    setAuthToken(token);

    // Create user object (without password)
    const user = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      role: newUser.role,
      photoURL: newUser.photoURL
    };

    // Save user to local storage
    setCurrentUser(user);

    return user;
  } catch (error) {
    logError('Registration failed', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    // Find user
    const user = mockUsers.find(user => user.email === email && user.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateMockToken(user);
    setAuthToken(token);

    // Create user object (without password)
    const userObj = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      photoURL: user.photoURL
    };

    // Save user to local storage
    setCurrentUser(userObj);

    return userObj;
  } catch (error) {
    logError('Login failed', error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Simulate Google sign-in with a default user
    const googleUser = {
      uid: `google-${Date.now()}`,
      email: `user.${Date.now()}@gmail.com`,
      displayName: 'Google User',
      role: 'employee',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user'
    };

    // Generate token
    const token = generateMockToken(googleUser);
    setAuthToken(token);

    // Save user to local storage
    setCurrentUser(googleUser);

    return googleUser;
  } catch (error) {
    logError('Google sign-in failed', error);
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    // Remove auth token and user from local storage
    removeAuthToken();
    removeCurrentUser();
  } catch (error) {
    logError('Logout failed', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    // Check if user exists
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      throw new Error('No user found with this email');
    }

    // In a real app, this would send a password reset email
    console.log(`[Mock Auth] Password reset email sent to ${email}`);
  } catch (error) {
    logError('Password reset failed', error);
    throw error;
  }
};

// Get employee details for the logged-in user
export const getEmployeeDetails = async (userId) => {
  try {
    // Simulate fetching employee details from a database
    const employee = {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      companyId: '12345',
      companyName: 'Example Company',
      position: 'Developer',
      status: 'active',
      visaExpiryDate: '2025-12-31',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return employee;
  } catch (error) {
    logError('Failed to fetch employee details', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken() && !!getCurrentUser();
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

// Auth state change listener
export const onAuthStateChange = (callback) => {
  // Initial call with current auth state
  const user = getCurrentUser();
  callback(user);

  // Listen for storage events to detect changes
  const handleStorageChange = (event) => {
    if (event.key === CURRENT_USER_KEY) {
      const user = event.newValue ? JSON.parse(event.newValue) : null;
      callback(user);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  registerUser,
  loginUser,
  signInWithGoogle,
  logout,
  resetPassword,
  isAuthenticated,
  isAdmin,
  onAuthStateChange
};
