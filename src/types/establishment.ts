export interface Establishment {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_image_url?: string;
  is_verified: boolean;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface ActivitySchedule {
  id: string;
  activity_id: string;
  date: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  price_per_person: number;
  currency: 'THB' | 'USD';
  is_active: boolean;
  created_at: string;
}

export interface ActivityReview {
  id: string;
  activity_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ActivityWithDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  duration?: string;
  difficulty_level?: string;
  max_participants?: number;
  min_age?: number;
  what_to_bring?: string[];
  what_is_included?: string[];
  meeting_point?: string;
  cancellation_policy?: string;
  image_url?: string;
  gallery_images?: string[];
  slug: string;
  establishment_id: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  activity_schedules: ActivitySchedule[];
  reviews: ActivityReview[];
  establishment?: Establishment;
}

export interface ReferralVisit {
  id: string;
  establishment_id: string;
  establishment_name: string;
  visited_at: string;
  ip_address: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}
