export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  location: string;
  rating: number;
  created_at: string;
  updated_at: string;
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