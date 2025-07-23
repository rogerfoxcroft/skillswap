export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  name: string; // Add name property
  location: string;
  rating: number;
  join_date: string; // Add join_date property
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  auth0_id: string;
  username: string;
  email: string;
  full_name: string;
  name: string;
  location: string;
  avatar?: string;
  bio?: string;
  rating: number;
  join_date: string;
  points: number;
  rank: string;
  review_count: number;
  skills: Skill[];
  reviews: Review[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  is_public: boolean;
  created_at: string;
  reviewer: User;
}

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  user_id: string;
  user: User;
  price: number;
  duration: number;
  location: string;
  is_active: boolean;
  level?: string;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}