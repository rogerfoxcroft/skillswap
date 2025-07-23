import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { clearAuth0State, debugAuth0State } from '../utils/auth-debug';

const Home: React.FC = () => {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Hero Section */}
      <div className="mobile-container py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            SkillSwap
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            Learn anything. Teach everything.
            <br />
            <span className="font-semibold text-primary-600">
              The hyperlocal skill exchange marketplace.
            </span>
          </p>
          
          {!isAuthenticated ? (
            <div className="space-y-4">
              <button
                onClick={() => loginWithRedirect()}
                className="btn-primary w-full md:w-auto md:mr-4"
              >
                Get Started
              </button>
              <p className="text-sm text-gray-600">
                Join thousands learning and teaching in your community
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Welcome back, {user?.name || 'there'}! 👋
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="btn-primary">
                  Browse Skills
                </button>
                <button className="btn-secondary">
                  Teach a Skill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mobile-container py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          How it works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Learn</h3>
            <p className="text-gray-600">
              Discover skills from your neighbors and local experts. From cooking to coding, find what interests you.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Teach</h3>
            <p className="text-gray-600">
              Share your expertise and earn while helping others. Turn your skills into income.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Connect</h3>
            <p className="text-gray-600">
              Build meaningful connections in your local community while learning and growing.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-primary-600 text-white py-12">
          <div className="mobile-container text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to start your learning journey?
            </h2>
            <p className="text-primary-100 mb-8">
              Join our community of learners and teachers today.
            </p>
            <button
              onClick={() => loginWithRedirect()}
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}

      {/* Debug Section - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 py-8">
          <div className="mobile-container text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🛠️ Development Debug Tools
            </h3>
            <div className="space-x-4">
              <button
                onClick={debugAuth0State}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                Debug Auth0 State
              </button>
              <button
                onClick={() => {
                  clearAuth0State();
                  window.location.reload();
                }}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
              >
                Clear Auth0 & Reload
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Check browser console for debug output
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;