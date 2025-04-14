import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { baseUrl } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${baseUrl}/api/v1/auth/forgot-password`, { email });
      setSubmitted(true);
      toast.success('If your email is registered, you will receive a password reset link');
    } catch (error) {
      console.error('Forgot password error:', error);
      // Don't show specific error to prevent email enumeration
      toast.info('If your email is registered, you will receive a password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          {!submitted ? (
            <p className="mt-2 text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          ) : (
            <p className="mt-2 text-green-600">
              If your email is registered, you will receive a password reset link shortly.
            </p>
          )}
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Remember your password? Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;