import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthButton: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-base font-medium text-gray-800">
          Hi, {user?.name || user?.email}
        </span>
        <button
          onClick={() => logout({ 
            logoutParams: { returnTo: window.location.origin } 
          })}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => loginWithRedirect({
          appState: { returnTo: '/dashboard' }
        })}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Login
      </button>
      <button
        onClick={() => loginWithRedirect({ 
          authorizationParams: { screen_hint: 'signup' },
          appState: { returnTo: '/dashboard' }
        })}
        className="btn-primary py-2 px-4"
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthButton;