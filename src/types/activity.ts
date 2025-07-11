import type { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ActivitySchedule = Database["public"]["Tables"]["activity_schedules"]["Row"] & {
  // Custom fields for calendar etc.
  scheduled_date?: string;
  available_spots?: number;
  capacity?: number;
  price_override?: number;
};
export type BaseBooking = Database["public"]["Tables"]["bookings"]["Row"];
export type ReviewUser = {
  full_name: string | null;
  avatar_url: string | null;
};

// Manually define Review as it seems to be missing from generated types
export interface Review {
    id: number;
    activity_id: number;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    users: ReviewUser | null;
    // Properties used in ActivityReviews component
    author: string;
    avatar: string;
    date: string;
    text: string;
}

export type ActivityOwner = Database["public"]["Tables"]["activity_owners"]["Row"];


// Extended / Custom types for the application
export type ActivityWithDetails = Activity & {
  categories: Category | null;
  activity_schedules: ActivitySchedule[];
  reviews: Review[];
  image_urls?: string[];
  currency?: string;
  location?: string | null;
  // Add dynamic fields as optional arrays of strings
  dynamic_highlights?: string[];
  dynamic_included?: string[];
  dynamic_not_included?: string[];
};

export type ActivityForHomepage = Pick<
  Activity,
  "id" | "title" | "b_price" | "image_url"
> & {
  slug?: string | null;
  category_name: string | null;
  average_rating?: number;
  location?: string;
  currency?: string;
};

// Add properties that are not in the base table but are needed in the app
export type Booking = BaseBooking & {
  activities?: {
    title: string;
    description?: string;
    image_urls?: string[];
    location?: string;
    image_url?: string;
    pickup_location?: string;
  };
  customer_name: string;
  customer_email: string;
  is_qr_booking?: boolean;
  establishment_id?: string;
  partner_id?: string;
  total_price?: number;
  user_id: string;
  provider_id: string;
  provider_amount: number;
  platform_fee: number;
};

export interface ScheduledActivity {
  id: string;
  title: string;
  day: string;
  time: string;
  activity: ActivityWithDetails;
  date: Date;
  // Add properties from activity for easier access
  duration?: number | string | null;
  hour?: string;
  image_url?: string | null;
  price?: number | null;
  participants: number;
}

export type ActivityScheduleInstance = ActivitySchedule;

// Other specific types
export interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Placeholder types for business logic
export interface Earning {
  month: string;
  amount: number; // Changed from total
}

export interface CommissionInvoice {
    id: string;
    invoice_number: string;
    provider_id: string;
    total_booking_amount: number;
    platform_commission_amount: number;
    invoice_status: "pending" | "paid" | "overdue" | "cancelled";
    due_date: string;
    paid_at?: string;
    provider?: {
        business_name: string;
    };
    is_qr_booking?: boolean;
    partner_commission_amount?: number;
    booking_id?: string;
    partner_commission_rate?: number;
}

export interface Provider {
    id: string;
    business_name: string;
    email: string;
    commission_invoices: CommissionInvoice[];
}

export interface CommissionStats {
    total_revenue: number;
    total_commission: number;
    pending_commission: number;
    paid_commission: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalCommissionAmount: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
}

export type SupabaseActivity = Activity;

export interface Message {
  id: string;
  created_at: string;
  message: string;
  sender_id: string;
  receiver_id: string;
  activity_id: string;
  sender: {
    full_name: string;
    avatar_url: string;
  };
}
