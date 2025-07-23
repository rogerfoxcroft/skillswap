import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiService, DashboardData } from '../services/api';

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const callApi = async <T>(apiCall: (token: string) => Promise<T>): Promise<T> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: "skillswapapi",
          scope: "openid profile email"
        }
      });
      
      console.log('Token obtained successfully'); // Debug log
      return await apiCall(token);
    } catch (error) {
      console.error('API call failed:', error);
      if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
      }
      throw new Error('Unknown API error occurred');
    }
  };

  return { callApi };
};

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { callApi } = useApi();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await callApi((token) => apiService.getUserDashboard(token));
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, error, refetch: fetchDashboard };
};