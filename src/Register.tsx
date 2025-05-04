import React, { useState, useRef, useEffect } from 'react';
import FormInput from './components/ui/FormInput';
import { isValidEmail } from './utils/validation';
import { AlertCircle, Mail, Lock, User, ArrowLeft, Calendar, Phone } from 'lucide-react';
import { useUI } from './context/UIContext';
import { OperationType } from './types/ui';
import { useAuth } from './context/AuthContext';
import GoogleSignInButton from './components/auth/GoogleSignInButton';

// Mock configuration status for development
const isMockAuthConfigured = () => true;
const getMockAuthStatus = () => ({ isConfigured: true, message: 'Using mock authentication for development' });

interface RegisterProps {
  onToggleForm?: () => void; // Optional callback to switch between login and register forms
}

const Register: React.FC<RegisterProps> = ({ onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [visaExpiryDate, setVisaExpiryDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Use the UI context to get the loading state
  const { loadingOperations, setLoading, showToast } = useUI();
  const isLoading = loadingOperations.includes(OperationType.AUTHENTICATION);

  // Use the Auth context
  const { register, error: authError, clearError } = useAuth();

  // Check if mock auth is configured
  const authStatus = getMockAuthStatus();
  const isAuthReady = isMockAuthConfigured();

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      // Clear authentication loading state when component unmounts
      setLoading(OperationType.AUTHENTICATION, false);
    };
  }, [setLoading]);

  // Focus the first input with an error after submission
  useEffect(() => {
    if (formSubmitted && Object.keys(errors).length > 0) {
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [errors, formSubmitted]);

  // Clear auth errors when inputs change
  useEffect(() => {
    if (authError) {
      clearError();
    }
  }, [name, email, password, confirmPassword, authError, clearError]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate phone (optional)
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate visa expiry date (optional)
    if (visaExpiryDate) {
      const expiryDate = new Date(visaExpiryDate);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.visaExpiryDate = 'Visa expiry date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validate form
    if (!validateForm()) {
      // Announce errors to screen readers
      if (statusRef.current) {
        statusRef.current.textContent = 'Form submission failed. Please correct the errors.';
      }
      return;
    }

    // Announce loading state to screen readers
    if (statusRef.current) {
      statusRef.current.textContent = 'Creating account, please wait...';
    }

    try {
      // Call the register function from AuthContext with additional employee data
      const success = await register(name, email, password, {
        visaExpiryDate,
        mobileNumber: phone,
        // Add other fields as needed
        trade: '',
        nationality: '',
        homePhoneNumber: '',
        companyId: '1' // Default company ID
      });

      if (success) {
        // Registration successful
        setRegistrationSuccess(true);
        if (statusRef.current) {
          statusRef.current.textContent = 'Registration successful. You can now log in.';
        }
        showToast('Registration successful! You can now log in.', 'success');
      } else {
        // Registration failed - error will be in AuthContext
        if (statusRef.current) {
          statusRef.current.textContent = 'Registration failed. Please check the form and try again.';
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Error handling is done by AuthContext
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-6" id="register-heading">
        Create Account
      </h1>

      {/* Screen reader status announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        ref={statusRef}
      ></div>

      {!isAuthReady && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md mb-6">
          <p className="font-medium">Authentication Configuration Issue</p>
          <p className="text-sm mt-1">{authStatus.message}</p>
        </div>
      )}

      {registrationSuccess ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
          <p className="font-medium">Registration Successful!</p>
          <p className="text-sm mt-1">Your account has been created. You can now log in with your credentials.</p>
          {onToggleForm && (
            <button
              onClick={onToggleForm}
              className="mt-4 inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Go to login
            </button>
          )}
        </div>
      ) : (
        <>
          {Object.keys(errors).length > 0 && formSubmitted && (
            <div
              className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start"
              role="alert"
              aria-labelledby="error-heading"
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h2 id="error-heading" className="font-medium">Please correct the following errors:</h2>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
              {authError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            ref={formRef}
            aria-labelledby="register-heading"
          >
            <FormInput
              id="name"
              name="name"
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              error={errors.name}
              autoComplete="name"
              validateOnBlur
              placeholder="Enter your full name"
              icon={<User className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              error={errors.email}
              autoComplete="email"
              validateOnBlur
              placeholder="Enter your email address"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              error={errors.password}
              autoComplete="new-password"
              validateOnBlur
              placeholder="Create a password (min. 6 characters)"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              error={errors.confirmPassword}
              autoComplete="new-password"
              validateOnBlur
              placeholder="Confirm your password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="phone"
              name="phone"
              label="Phone Number (Optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              error={errors.phone}
              autoComplete="tel"
              validateOnBlur
              placeholder="Enter your phone number"
              icon={<Phone className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="visaExpiryDate"
              name="visaExpiryDate"
              label="Visa Expiry Date (Optional)"
              type="date"
              value={visaExpiryDate}
              onChange={(e) => setVisaExpiryDate(e.target.value)}
              disabled={isLoading}
              error={errors.visaExpiryDate}
              validateOnBlur
              icon={<Calendar className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex justify-between mt-6">
              {onToggleForm && (
                <button
                  type="button"
                  onClick={onToggleForm}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Already have an account? Sign in
                </button>
              )}

              <button
                type="submit"
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isLoading || !isAuthReady}
                aria-busy={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleSignInButton text="Sign up with Google" />
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Register;
