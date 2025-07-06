
export interface Activity {
  id: number;
  activity_id?: number;
  title: string;
  name?: string;
  description: string;
  price_per_person: number;
  duration_hours: number;
  duration?: string;
  availability: string;
  location: string;
  category: string;
  category_id?: number;
  images: { url: string }[];
  image_url?: string;
  inclusions: string[];
  exclusions: string[];
  reviews: {
    rating: number;
    comment: string;
  }[];
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  booking_count?: number;
  total_revenue?: number;
  final_price?: number;
  b_price?: number;
  price?: number;
  status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'published' | 'archived' | number;
  video_url?: string;
  video_duration?: string;
  quantity?: number; // For cart/planning
  date?: Date; // For cart/planning
  max_participants?: number;
  rating?: number;
  highlights?: string[];
  included?: string[];
}

export interface Category {
  id: number;
  name: string;
}

export enum ActivityStatus {
  Archived = 0,
  Draft = 1,
  Published = 2,
}
