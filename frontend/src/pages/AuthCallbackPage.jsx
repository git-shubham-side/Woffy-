import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      if (token) {
        localStorage.setItem('woffy_token', token);
        await refreshUser();
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=Google_Callback_Failed', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 font-medium text-sm">Completing Google authentication...</p>
    </div>
  );
};

export default AuthCallbackPage;
