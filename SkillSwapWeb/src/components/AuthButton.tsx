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
        <span className="text-sm text-gray-700">
          Hi, {user?.name || user?.email}
        </span>
        <button
          onClick={() => logout({ 
            logoutParams: { returnTo: window.location.origin } 
          })}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => loginWithRedirect()}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        Login
      </button>
      <button
        onClick={() => loginWithRedirect({ 
          authorizationParams: { screen_hint: 'signup' } 
        })}
        className="btn-primary text-sm py-2 px-4"
      >
        Sign Up
      </button>
    </div>
  );
};

export default AuthButton;