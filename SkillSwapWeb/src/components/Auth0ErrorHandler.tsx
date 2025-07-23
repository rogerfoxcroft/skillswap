import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { clearAuth0State, debugAuth0State } from '../utils/auth-debug';

interface Auth0ErrorHandlerProps {
  children: React.ReactNode;
}

const Auth0ErrorHandler: React.FC<Auth0ErrorHandlerProps> = ({ children }) => {
  const { error, isLoading } = useAuth0();

  useEffect(() => {
    if (error) {
      console.error('Auth0 Error:', error);
      debugAuth0State();
      
      // Handle specific error types
      if (error.message.includes('Invalid state') || 
          error.message.includes('state mismatch') ||
          error.message.includes('invalid_request')) {
        console.log('Detected state/request error, clearing Auth0 state...');
        clearAuth0State();
        
        // Show user-friendly message and reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [error]);

  // Handle URL with error parameters (common Auth0 callback errors)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (errorParam) {
      console.error('Auth0 URL Error:', errorParam, errorDescription);
      
      if (errorParam === 'invalid_request' || errorParam === 'invalid_state') {
        clearAuth0State();
        // Clean URL and reload
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="mobile-container text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Authentication Error
            </h2>
            <p className="text-red-700 mb-4">
              {error.message.includes('Invalid state') 
                ? 'Authentication session expired. Refreshing...' 
                : error.message}
            </p>
            
            {error.message.includes('Invalid state') ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="ml-2 text-red-600">Clearing session and reloading...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => {
                    clearAuth0State();
                    window.location.reload();
                  }}
                  className="btn-primary"
                >
                  Clear Session & Retry
                </button>
                <button
                  onClick={() => debugAuth0State()}
                  className="btn-secondary block mx-auto"
                >
                  Debug Info (Check Console)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default Auth0ErrorHandler;