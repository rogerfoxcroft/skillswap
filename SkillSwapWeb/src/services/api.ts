import { Skill, UserProfile, Review } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface DashboardData {
  user: UserProfile;
  my_skills: Skill[];
  recent_bookings: Booking[];
  stats: UserStats;
}

export interface UserStats {
  total_skills_offered: number;
  total_bookings: number;
  total_earnings: number;
  average_rating: number;
  points: number;
  rank: string;
}


export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: { [key: number]: number };
}

export interface ProfileResponse {
  user: UserProfile;
  skills: Skill[];
  reviews: Review[];
  review_summary: ReviewSummary;
}

export interface Booking {
  id: string;
  skill_id: string;
  student_id: string;
  teacher_id: string;
  scheduled_at: string;
  status: string;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private getAuthHeaders(token: string): HeadersInit {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Public endpoints
  async getPublicSkills(): Promise<Skill[]> {
    const response = await fetch(`${API_BASE_URL}/public/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    return response.json();
  }

  async searchSkills(params: { category?: string; location?: string; query?: string }): Promise<Skill[]> {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.location) searchParams.append('location', params.location);
    if (params.query) searchParams.append('query', params.query);

    const response = await fetch(`${API_BASE_URL}/public/skills/search?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to search skills');
    }
    return response.json();
  }

  // Protected endpoints
  async getUserDashboard(token: string): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}/protected/dashboard`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getUserProfile(token: string, userId?: string): Promise<ProfileResponse> {
    const endpoint = userId ? `/protected/profile/${userId}` : '/protected/profile';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getMySkills(token: string): Promise<Skill[]> {
    const response = await fetch(`${API_BASE_URL}/protected/my-skills`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user skills: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();