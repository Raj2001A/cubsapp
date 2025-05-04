/**
 * Authentication types
 */

import type { User } from './user';
import type { Employee } from './employees';

// Remove old User interface; use the one from './user'
// export interface User {
//   uid: string;
//   email: string | null;
//   displayName: string | null;
//   role: 'Administrator' | 'employee';
//   photoURL?: string | null;
//   employeeId?: string; // Reference to employee record if role is 'employee'
// }

export interface AuthResponse {
  user: User;
  token: string;
  employeeDetails: Employee | null;
}

export interface AuthState {
  user: User | null;
  employeeDetails: Employee | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  employeeDetails: Employee | null;
  token?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string, additionalData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword?: (email: string) => Promise<void>;
  clearError: () => void;
  visaReminder: boolean;
  setVisaReminder: (reminder: boolean) => void;
}
