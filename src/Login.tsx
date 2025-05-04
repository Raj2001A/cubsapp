import React, { useState, useRef, useEffect } from 'react';
import FormInput from './components/ui/FormInput';
import { validateField, isValidEmail } from './utils/validation';
import { AlertCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useUI } from './context/UIContext';
import { useAuth } from './context/AuthContext';
import Register from './Register';
import GoogleSignInButton from './components/auth/GoogleSignInButton';
import { OperationType } from './types/ui';
import { useNavigate } from 'react-router-dom';
import { FadeSlideUp, MotionButton } from './components/ui/MotionWrappers';

// Mock configuration status for development
const isMockAuthConfigured = () => true;
const getMockAuthStatus = () => ({ isConfigured: true, message: 'Using mock authentication for development' });

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Use the UI context to get the loading state
  const { loadingOperations, setLoading } = useUI();
  const isLoading = loadingOperations.includes(OperationType.AUTHENTICATION);

  // Use the Auth context
  const { login, resetPassword, error: authError, clearError } = useAuth();

  // Use the navigate hook
  const navigate = useNavigate();

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email
    const emailError = validateField('email', email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
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
      statusRef.current.textContent = 'Signing in, please wait...';
    }

    try {
      // Call the login function from AuthContext
      const success = await login(email, password);

      if (success) {
        // Login successful - redirect to dashboard
        if (statusRef.current) {
          statusRef.current.textContent = 'Sign in successful. Redirecting...';
        }
        navigate('/dashboard');
      } else {
        // Login failed - error will be in AuthContext
        if (statusRef.current) {
          statusRef.current.textContent = 'Sign in failed. Please check your credentials.';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error handling is done by AuthContext
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!resetEmail || !isValidEmail(resetEmail)) {
      setErrors({ resetEmail: 'Please enter a valid email address' });
      return;
    }

    try {
      if (resetPassword) {
        await resetPassword(resetEmail);
      }
      setResetSent(true);
      setErrors({});
    } catch (error) {
      console.error('Password reset error:', error);
      // Error handling is done by AuthContext
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setShowRegister(false);
    setResetSent(false);
    setResetEmail(email); // Pre-fill with login email
    setErrors({});
  };

  const toggleRegister = () => {
    setShowRegister(!showRegister);
    setShowForgotPassword(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center" style={{ background: 'none' }}>
      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="relative z-10 w-full bg-white shadow-2xl rounded-3xl border-4 border-[#DD1A51] p-10 flex flex-col items-center">
          <img src="/companylogo.png" alt="CUBS Group of Companies Logo" className="h-20 mb-3 drop-shadow-lg" />
          <h1 className="text-[#DD1A51] text-3xl font-extrabold mb-1 tracking-tight text-center drop-shadow">CUBS GROUP OF COMPANIES</h1>
          <div className="text-xs text-[#b3123e] mb-8 text-center tracking-wider">UAE-QATAR-OMAN-KSA</div>
          {showRegister ? (
            <Register onToggleForm={toggleRegister} />
          ) : showForgotPassword ? (
            // Password Reset Form
            <div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-6" id="reset-heading">
                Reset Password
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

              {resetSent ? (
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                  <p className="font-medium">Password Reset Email Sent</p>
                  <p className="text-sm mt-1">Please check your email for instructions to reset your password.</p>
                  <button
                    onClick={toggleForgotPassword}
                    className="mt-4 inline-flex items-center text-sm font-medium text-green-700 hover:text-green-900"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Return to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} noValidate>
                  <FormInput
                    id="resetEmail"
                    name="resetEmail"
                    label="Email Address"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    error={errors.resetEmail}
                    autoComplete="email"
                    validateOnBlur
                    placeholder="Enter your email address"
                  />

                  {authError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                      {authError}
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={toggleForgotPassword}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Back to login
                    </button>

                    <button
                      type="submit"
                      className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      disabled={isLoading || !isAuthReady}
                      aria-busy={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            // Login Form
            <FadeSlideUp>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-6" id="login-heading">
                Sign In
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
                  <p className="text-sm mt-1">You can still use the demo login.</p>
                </div>
              )}

              <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
                <p className="font-medium mb-2">Demo Login Options:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Admin: admin@example.com / password123</li>
                  <li>Employee: Use any email from the employee list with password123</li>
                  <li>Example: lacey.smith@cubstechcontracting.ae / password123</li>
                </ul>
              </div>

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
                aria-labelledby="login-heading"
              >
                <FormInput
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) clearError();
                  }}
                  required
                  disabled={isLoading}
                  error={errors.email}
                  autoComplete="email"
                  validateOnBlur
                  placeholder="Enter your email address"
                />

                <FormInput
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) clearError();
                  }}
                  required
                  disabled={isLoading}
                  error={errors.password}
                  autoComplete="current-password"
                  validateOnBlur
                  placeholder="Enter your password"
                />

                <div className="flex justify-between mt-2 mb-4">
                  <button
                    type="button"
                    onClick={toggleRegister}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Create account
                  </button>
                  <button
                    type="button"
                    onClick={toggleForgotPassword}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Forgot password?
                  </button>
                </div>

                <MotionButton
                  type="submit"
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </MotionButton>

                <div className="mt-4 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <GoogleSignInButton />
                </div>
              </form>
            </FadeSlideUp>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
