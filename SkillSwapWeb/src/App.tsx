import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AuthButton from './components/AuthButton';
import ProtectedRoute from './components/ProtectedRoute';
import Auth0ErrorHandler from './components/Auth0ErrorHandler';
import { useDashboard } from './hooks/useApi';

// Protected dashboard component
const Dashboard: React.FC = () => {
  const { user } = useAuth0();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="mobile-container py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">SkillSwap</h1>
          <AuthButton />
        </div>
      </nav>
      
      <DashboardContent />
    </div>
  );
};

// Separate component for dashboard content that uses the API
const DashboardContent: React.FC = () => {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="mobile-container py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-container py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error loading dashboard</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mobile-container py-8">
        <div className="text-center text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="mobile-container py-8 space-y-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome back, {data.user.name}! 👋
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {data.user.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Location:</span> {data.user.location}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Rating:</span> ⭐ {data.user.rating}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Member since:</span> {data.user.join_date}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-primary-600">{data.stats.total_skills_offered}</div>
          <div className="text-sm text-gray-600">Skills Offered</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{data.stats.total_bookings}</div>
          <div className="text-sm text-gray-600">Bookings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">${data.stats.total_earnings}</div>
          <div className="text-sm text-gray-600">Earnings</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-yellow-600">⭐ {data.stats.average_rating}</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* My Skills */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">My Skills</h3>
        {data.my_skills.length > 0 ? (
          <div className="space-y-3">
            {data.my_skills.map((skill) => (
              <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-primary-600 font-medium">${skill.price}/session</span>
                      <span className="text-sm text-gray-500">{skill.duration} min</span>
                      <span className="text-sm text-gray-500">{skill.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No skills offered yet.</p>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h3>
        {data.recent_bookings.length > 0 ? (
          <div className="space-y-3">
            {data.recent_bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Booking #{booking.id}</p>
                    <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-green-600 font-medium">${booking.total_price}</span>
                      <span className="text-sm text-gray-500">Status: {booking.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent bookings.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="btn-primary">
          Browse Skills
        </button>
        <button className="btn-secondary">
          Add New Skill
        </button>
        <a href="/profile" className="btn-secondary text-center">
          View My Profile
        </a>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SkillSwap...</p>
        </div>
      </div>
    );
  }

  return (
    <Auth0ErrorHandler>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:userId?" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Auth0ErrorHandler>
  );
};

export default App;