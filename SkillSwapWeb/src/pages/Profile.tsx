import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService, ProfileResponse } from '../services/api';
import StarRating from '../components/StarRating';
import RankBadge from '../components/RankBadge';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);
        
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: "skillswapapi",
            scope: "openid profile email"
          }
        });
        
        const profileData = await apiService.getUserProfile(token, userId);
        setProfile(profileData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isAuthenticated, getAccessTokenSilently]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="mobile-container text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">Profile not found</div>
      </div>
    );
  }

  const { user, skills, reviews, review_summary } = profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mobile-container py-6">
          <div className="flex items-center space-x-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.full_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.full_name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.full_name}</h1>
              <p className="text-gray-600">@{user.username}</p>
              {user.location && (
                <p className="text-gray-500 text-sm">📍 {user.location}</p>
              )}
              
              <div className="flex items-center space-x-4 mt-2">
                <RankBadge rank={user.rank} points={user.points} />
                <div className="flex items-center space-x-1">
                  <StarRating rating={user.rating} readonly size="sm" />
                  <span className="text-sm text-gray-600">
                    ({user.review_count} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {user.bio && (
            <div className="mt-4">
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-primary-600">{user.points}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">{skills.length}</div>
            <div className="text-sm text-gray-600">Skills</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-blue-600">{review_summary.total_reviews}</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ⭐ {review_summary.average_rating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Rating</div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Skills Offered ({skills.length})
          </h2>
          
          {skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{skill.title}</h3>
                    <span className="text-sm font-medium text-primary-600">
                      ${skill.price}/session
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{skill.category}</span>
                    <span>{skill.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No skills offered yet.</p>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reviews ({review_summary.total_reviews})
          </h2>
          
          {review_summary.total_reviews > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {review_summary.average_rating.toFixed(1)}
                </div>
                <div>
                  <StarRating rating={review_summary.average_rating} readonly />
                  <p className="text-sm text-gray-600">
                    Based on {review_summary.total_reviews} reviews
                  </p>
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = review_summary.rating_breakdown[stars] || 0;
                  const percentage = review_summary.total_reviews > 0 
                    ? (count / review_summary.total_reviews) * 100 
                    : 0;
                  
                  return (
                    <div key={stars} className="flex items-center space-x-2 text-sm">
                      <span className="w-8">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Individual Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {review.reviewer.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {review.reviewer.full_name}
                        </span>
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;