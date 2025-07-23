import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AuthButton from './components/AuthButton';
import ProtectedRoute from './components/ProtectedRoute';
import Auth0ErrorHandler from './components/Auth0ErrorHandler';
import ProfileEditor from './components/ProfileEditor';
import SkillsList from './components/SkillsList';
import RankBadge from './components/RankBadge';
import { useDashboard } from './hooks/useApi';
import { UserProfile, Skill } from './types';
import { apiService } from './services/api';
import { formatCurrency } from './utils/currency';

// Navigation component for authenticated pages
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="container-responsive py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard">
              <img src="/logo.png" alt="SkillSwap" className="h-16 w-auto cursor-pointer" />
            </Link>
          </div>
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </nav>
      
      {children}
    </div>
  );
};

// Protected dashboard component
const Dashboard: React.FC = () => {
  return <DashboardContent />;
};

// Separate component for dashboard content that uses the API
const DashboardContent: React.FC = () => {
  const { data, loading, error, refetch } = useDashboard();
  const { getAccessTokenSilently } = useAuth0();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'profile' | 'skills'>('overview');
  const [isSaving, setIsSaving] = useState(false);

  const handleTabChange = (newTab: 'overview' | 'profile' | 'skills') => {
    // Reset edit states when switching tabs
    setIsEditingProfile(false);
    setCurrentView(newTab);
  };

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      setIsSaving(true);
      const token = await getAccessTokenSilently();
      await apiService.updateProfile(token, updatedProfile);
      setIsEditingProfile(false);
      // Refresh the dashboard data to show updated profile
      refetch();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = (skill: Partial<Skill>) => {
    // TODO: Implement API call to add skill
    console.log('Adding skill:', skill);
  };

  // TODO: Implement skill editing functionality
  // const handleEditSkill = (skillId: string, skill: Partial<Skill>) => {
  //   console.log('Editing skill:', skillId, skill);
  // };

  // const handleDeleteSkill = (skillId: string) => {
  //   console.log('Deleting skill:', skillId);
  // };

  if (loading) {
    return (
      <div className="container-responsive py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-responsive py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error loading dashboard</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-responsive py-8">
        <div className="text-center text-gray-600">No data available</div>
      </div>
    );
  }

  // Debug log to see what data we're getting
  console.log('Dashboard data:', data);

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {(data.user.full_name && data.user.full_name.trim()) || data.user.email}! 👋
            </h1>
            <p className="text-gray-600">Manage your profile and skills</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <RankBadge rank={data.user?.rank} points={data.user?.points} />
            <div className="text-right">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="text-lg font-semibold">⭐ {data.user?.rating || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl" role="tablist">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'profile', label: 'My Profile', icon: '👤' },
            { key: 'skills', label: 'My Skills', icon: '🎯' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex-1 ${
                currentView === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
              role="tab"
              aria-selected={currentView === tab.key}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {currentView === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-primary-600 mb-2">{data.stats?.total_skills_offered || 0}</div>
              <div className="text-sm text-gray-600">Skills Offered</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600 mb-2">{data.stats?.total_bookings || 0}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(data.stats?.total_earnings || 0)}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-yellow-600 mb-2">⭐ {data.stats?.average_rating || 0}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Skills</h3>
              {(data.my_skills || []).slice(0, 3).map((skill) => (
                <div key={skill.id} className="border-b border-gray-200 last:border-b-0 py-3">
                  <h4 className="font-medium text-gray-900">{skill.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{skill.category} • {formatCurrency(skill.price)}/session</p>
                </div>
              ))}
              {(data.my_skills || []).length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h3>
              {(data.recent_bookings || []).slice(0, 3).map((booking) => (
                <div key={booking.id} className="border-b border-gray-200 last:border-b-0 py-3">
                  <p className="font-medium text-gray-900">Booking #{booking.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatCurrency(booking.total_price)} • {booking.status}</p>
                </div>
              ))}
              {(data.recent_bookings || []).length === 0 && (
                <p className="text-gray-500 text-sm">No recent bookings</p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentView === 'profile' && (
        <div className="max-w-4xl">
          {isEditingProfile ? (
            <ProfileEditor
              profile={data.user}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditingProfile(false)}
              isSaving={isSaving}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                <button onClick={() => setIsEditingProfile(true)} className="btn-primary">
                  Edit Profile
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Full Name</span>
                      <p className="text-gray-900">{data.user.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Username</span>
                      <p className="text-gray-900">@{data.user.username}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p className="text-gray-900">{data.user.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Location</span>
                      <p className="text-gray-900">{data.user.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Community Standing</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Points</span>
                      <p className="text-gray-900">{data.user.points}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Rank</span>
                      <p className="text-gray-900">{data.user.rank}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Rating</span>
                      <p className="text-gray-900">⭐ {data.user.rating} ({data.user.review_count} reviews)</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Member Since</span>
                      <p className="text-gray-900">{new Date(data.user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {data.user.bio && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">{data.user.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentView === 'skills' && (
        <SkillsList
          skills={data.my_skills}
          onAddSkill={handleAddSkill}
        />
      )}
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
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/:userId?" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Auth0ErrorHandler>
  );
};

export default App;