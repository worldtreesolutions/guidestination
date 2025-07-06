
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          id: number
          title: string
          description: string
          price: number
          location: string
          image_urls: string[]
          category_id: number
          owner_id: string
          created_at: string
          updated_at: string
          is_active: boolean
          duration: number
          booking_type: "daily" | "hourly"
          max_participants: number | null
          rating: number | null
          review_count: number | null
          languages: string[] | null
          highlights: string[] | null
          meeting_point: string | null
          included: string[] | null
          not_included: string[] | null
          name?: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          price: number
          location: string
          image_urls: string[]
          category_id: number
          owner_id: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          duration: number
          booking_type?: "daily" | "hourly"
          max_participants?: number | null
          rating?: number | null
          review_count?: number | null
          languages?: string[] | null
          highlights?: string[] | null
          meeting_point?: string | null
          included?: string[] | null
          not_included?: string[] | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          price?: number
          location?: string
          image_urls?: string[]
          category_id?: number
          owner_id?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          duration?: number
          booking_type?: "daily" | "hourly"
          max_participants?: number | null
          rating?: number | null
          review_count?: number | null
          languages?: string[] | null
          highlights?: string[] | null
          meeting_point?: string | null
          included?: string[] | null
          not_included?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "activity_owners"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_owners: {
        Row: {
          id: string
          user_id: string
          email: string
          created_at: string
          updated_at: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_owners_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          activity_id: number
          customer_id: string | null
          customer_name: string
          customer_email: string
          booking_date: string
          participants: number
          total_amount: number
          status: "pending" | "confirmed" | "completed" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: number
          customer_id?: string | null
          customer_name: string
          customer_email: string
          booking_date: string
          participants: number
          total_amount: number
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: number
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          booking_date?: string
          participants?: number
          total_amount?: number
          status?: "pending" | "confirmed" | "completed" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      establishment_activities: {
        Row: {
          establishment_id: string
          activity_id: number
        }
        Insert: {
          establishment_id: string
          activity_id: number
        }
        Update: {
          establishment_id?: string
          activity_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "establishment_activities_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_activities_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      establishment_commissions: {
        Row: {
          id: string
          establishment_id: string
          booking_id: string
          commission_amount: number
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          booking_id: string
          commission_amount: number
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          booking_id?: string
          commission_amount?: number
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_commissions_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_commissions_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      establishments: {
        Row: {
          id: string
          partner_id: string
          name: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          name: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          name?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishments_partner_id_fkey"
            columns: ["partner_id"]
            referencedRelation: "partner_registrations"
            referencedColumns: ["id"]
          }
        ]
      }
      partner_registrations: {
        Row: {
          id: string
          user_id: string | null
          business_name: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude: number | null
          longitude: number | null
          place_id: string | null
          status: "pending" | "approved" | "rejected"
          commission_package: "basic" | "premium"
          supporting_documents: string[]
          created_at: string
          updated_at: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          business_name: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          status?: "pending" | "approved" | "rejected"
          commission_package?: "basic" | "premium"
          supporting_documents: string[]
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string | null
          business_name?: string
          owner_name?: string
          email?: string
          phone?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          status?: "pending" | "approved" | "rejected"
          commission_package?: "basic" | "premium"
          supporting_documents?: string[]
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_registrations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referral_visits: {
        Row: {
          id: string
          establishment_id: string
          ip_address: string
          visit_date: string
        }
        Insert: {
          id?: string
          establishment_id: string
          ip_address: string
          visit_date?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          ip_address?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_visits_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          activity_id: number
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: number
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: number
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stripe_checkout_sessions: {
        Row: {
          id: string
          stripe_session_id: string
          activity_id: number
          provider_id: string
          amount: number
          commission_percent: number
          status: string
          created_at: string
          participants: number
          booking_date: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          establishment_id: string | null
          booking_source: string
        }
        Insert: {
          id?: string
          stripe_session_id: string
          activity_id: number
          provider_id: string
          amount: number
          commission_percent: number
          status: string
          created_at?: string
          participants: number
          booking_date: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          establishment_id?: string | null
          booking_source?: string
        }
        Update: {
          id?: string
          stripe_session_id?: string
          activity_id?: number
          provider_id?: string
          amount?: number
          commission_percent?: number
          status?: string
          created_at?: string
          participants?: number
          booking_date?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          establishment_id?: string | null
          booking_source?: string
        }
        Relationships: []
      }
      stripe_payouts: {
        Row: {
          id: string
          partner_id: string | null
          activity_owner_id: string | null
          amount: number
          status: string
          payout_date: string
          created_at: string
        }
        Insert: {
          id?: string
          partner_id?: string | null
          activity_owner_id?: string | null
          amount: number
          status: string
          payout_date: string
          created_at?: string
        }
        Update: {
          id?: string
          partner_id?: string | null
          activity_owner_id?: string | null
          amount?: number
          status?: string
          payout_date?: string
          created_at?: string
        }
        Relationships: []
      }
      stripe_transfers: {
        Row: {
          id: string
          checkout_session_id: string
          recipient_type: "partner" | "provider"
          recipient_id: string
          amount: number
          status: string
          failure_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          checkout_session_id: string
          recipient_type: "partner" | "provider"
          recipient_id: string
          amount: number
          status: string
          failure_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          checkout_session_id?: string
          recipient_type?: "partner" | "provider"
          recipient_id?: string
          amount?: number
          status?: string
          failure_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          id: string
          stripe_event_id: string
          event_type: string
          processed: boolean
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          stripe_event_id: string
          event_type: string
          processed?: boolean
          payload: Json
          created_at?: string
        }
        Update: {
          id?: string
          stripe_event_id?: string
          event_type?: string
          processed?: boolean
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          activity_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
