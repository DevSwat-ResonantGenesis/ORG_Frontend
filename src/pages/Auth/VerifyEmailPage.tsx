import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import fastapiClient from '@/api/fastapiClient';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fastapiClient.post('/auth/verify-email', { token });
        
        if (response.data?.success || response.data?.email_verified) {
          setStatus('success');
          setMessage(response.data?.message || 'Your email has been verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Email verified! You can now log in.' }
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(response.data?.message || 'Failed to verify email.');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.message || 
                           'Failed to verify email. The link may have expired.';
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
              <p className="text-gray-400">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </div>
          )}

          {status === 'no-token' && (
            <div className="text-center">
              <Mail className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Token Provided</h2>
              <p className="text-gray-400 mb-6">
                Please use the verification link sent to your email address.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
