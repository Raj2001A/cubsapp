import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Lock, Mail, User, Calendar, Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import EmailService from '../../services/emailService';
import { EMAIL } from '../../config';
import FormInput from '../ui/FormInput';

const emailService = new EmailService({
  smtpHost: EMAIL.SMTP_HOST,
  smtpPort: EMAIL.SMTP_PORT,
  smtpUser: EMAIL.SMTP_USER,
  smtpPass: EMAIL.SMTP_PASS,
  fromEmail: EMAIL.FROM_EMAIL
});

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visaExpiryDate, setVisaExpiryDate] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { register: registerUser, error } = useAuth();
  const navigate = useNavigate();

  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    // Removed unused today variable
  }, []);

  const isAdminEmail = email.includes('admin');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      // Register the user
      if (typeof registerUser === 'function') {
        const success = await registerUser(
          name,
          email,
          password,
          {
            visaExpiryDate,
            mobileNumber: phone
          }
        );
        if (success) {
          // Send welcome email
          try {
            const emailId = await emailService.sendWelcomeEmail(email, name);
            // Track email status
            // TODO: Fix the type for setEmailStatus if needed
            setEmailStatus('pending');
            // Start polling for email status
            const statusInterval = setInterval(async () => {
              const status = emailService.getEmailStatus(emailId);
              if (status) {
                setEmailStatus(status.status);
                if (status.status !== 'pending') {
                  clearInterval(statusInterval);
                }
              }
            }, 1000);
            // Navigate to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } catch (error) {
            console.error('Failed to send welcome email:', error);
            // Still navigate to dashboard even if welcome email fails
            navigate('/dashboard');
          }
        }
      } else {
        setFormError('Registration function is not available.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setFormError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || formError) && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{formError || error}</p>
                  </div>
                </div>
              </div>
            )}

            <FormInput
              id="name"
              name="name"
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Full Name"
              icon={<User className="h-5 w-5 text-gray-400" />}
            />

            <FormInput
              id="email"
              name="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />

            {!isAdminEmail && (
              <>
                <FormInput
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  value={formatPhoneNumber(phone)}
                  onChange={handlePhoneChange}
                  required
                  placeholder="Phone Number"
                  icon={<Phone className="h-5 w-5 text-gray-400" />}
                />

                <FormInput
                  id="visaExpiryDate"
                  name="visaExpiryDate"
                  label="Visa Expiry Date"
                  type="date"
                  value={visaExpiryDate}
                  onChange={(e) => setVisaExpiryDate(e.target.value)}
                  required
                  placeholder="Visa Expiry Date"
                  icon={<Calendar className="h-5 w-5 text-gray-400" />}
                />
              </>
            )}

            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
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
              placeholder="Confirm Password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Email Status Notification */}
      {emailStatus && (
        <div
          className={`rounded-md p-4 ${
            emailStatus === 'sent'
              ? 'bg-green-50'
              : emailStatus === 'failed'
              ? 'bg-red-50'
              : 'bg-yellow-50'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {emailStatus === 'sent' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : emailStatus === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {emailStatus === 'sent'
                  ? 'Welcome email sent successfully'
                  : emailStatus === 'failed'
                  ? 'Failed to send welcome email'
                  : 'Sending welcome email...'}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
