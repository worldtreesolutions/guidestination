
import type { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ActivitySchedule = Database["public"]["Tables"]["activity_schedules"]["Row"];
export type BaseBooking = Database["public"]["Tables"]["bookings"]["Row"];
export type ReviewUser = {
  full_name: string | null;
  avatar_url: string | null;
};
export type Review = Database["public"]["Tables"]["reviews"]["Row"] & {
  users: ReviewUser | null;
};

// Extended / Custom types for the application
export type ActivityWithDetails = Activity & {
  categories: Category | null;
  activity_schedules: ActivitySchedule[];
  reviews: Review[];
  image_urls?: string[]; // Make it optional
};

export type ActivityForHomepage = Pick<
  Activity,
  "id" | "title" | "b_price" | "image_url" | "slug"
> & {
  category_name: string | null;
  average_rating?: number;
  location?: string;
  currency?: string;
};

// Add properties that are not in the base table but are needed in the app
export type Booking = BaseBooking & {
  activities?: Activity;
};

export interface ScheduledActivity {
  id: string;
  title: string;
  day: string;
  time: string;
  activity: ActivityWithDetails;
  date: Date;
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
  total: number;
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
}

export type SupabaseActivity = Activity;
