export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: number
          title: string
          description: string | null
          image_url: string | null
          pickup_location: string | null
          dropoff_location: string | null
          discounts: number | null
          max_participants: number | null
          highlights: string | null
          included: string | null
          not_included: string | null
          meeting_point: string | null
          languages: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          b_price: number | null
          status: number | null
          location_lat: number | null
          location_lng: number | null
          place_id: string | null
          address: string | null
          location_geom: unknown | null
          provider_id: string | null
          final_price: number | null
          video_url: string | null
          video_duration: number | null
          video_size: number | null
          video_thumbnail_url: string | null
          duration: string | null
          min_age: number | null
          max_age: number | null
          activity_name: string | null
          technical_skill_level: string | null
          physical_effort_level: string | null
          category: string | null
          average_rating: number | null
          review_count: number | null
          includes_pickup: boolean | null
          pickup_locations: string | null
          includes_meal: boolean | null
          meal_description: string | null
          name: string | null
          requires_approval: boolean
          instant_booking: boolean | null
          cancellation_policy: string | null
          base_price_thb: number | null
          currency_code: string | null
          country_code: string | null
          created_by: string | null
          updated_by: string | null
          meeting_point_place_id: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meeting_point_formatted_address: string | null
          dropoff_location_place_id: string | null
          dropoff_location_lat: number | null
          dropoff_location_lng: number | null
          dropoff_location_formatted_address: string | null
          pickup_location_place_id: string | null
          pickup_location_lat: number | null
          pickup_location_lng: number | null
          pickup_location_formatted_address: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          image_url?: string | null
          pickup_location?: string | null
          dropoff_location?: string | null
          discounts?: number | null
          max_participants?: number | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          meeting_point?: string | null
          languages?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          b_price?: number | null
          status?: number | null
          location_lat?: number | null
          location_lng?: number | null
          place_id?: string | null
          address?: string | null
          location_geom?: unknown | null
          provider_id?: string | null
          final_price?: number | null
          video_url?: string | null
          video_duration?: number | null
          video_size?: number | null
          video_thumbnail_url?: string | null
          duration?: string | null
          min_age?: number | null
          max_age?: number | null
          activity_name?: string | null
          technical_skill_level?: string | null
          physical_effort_level?: string | null
          category?: string | null
          average_rating?: number | null
          review_count?: number | null
          includes_pickup?: boolean | null
          pickup_locations?: string | null
          includes_meal?: boolean | null
          meal_description?: string | null
          name?: string | null
          requires_approval?: boolean
          instant_booking?: boolean | null
          cancellation_policy?: string | null
          base_price_thb?: number | null
          currency_code?: string | null
          country_code?: string | null
          created_by?: string | null
          updated_by?: string | null
          meeting_point_place_id?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_formatted_address?: string | null
          dropoff_location_place_id?: string | null
          dropoff_location_lat?: number | null
          dropoff_location_lng?: number | null
          dropoff_location_formatted_address?: string | null
          pickup_location_place_id?: string | null
          pickup_location_lat?: number | null
          pickup_location_lng?: number | null
          pickup_location_formatted_address?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          image_url?: string | null
          pickup_location?: string | null
          dropoff_location?: string | null
          discounts?: number | null
          max_participants?: number | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          meeting_point?: string | null
          languages?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          b_price?: number | null
          status?: number | null
          location_lat?: number | null
          location_lng?: number | null
          place_id?: string | null
          address?: string | null
          location_geom?: unknown | null
          provider_id?: string | null
          final_price?: number | null
          video_url?: string | null
          video_duration?: number | null
          video_size?: number | null
          video_thumbnail_url?: string | null
          duration?: string | null
          min_age?: number | null
          max_age?: number | null
          activity_name?: string | null
          technical_skill_level?: string | null
          physical_effort_level?: string | null
          category?: string | null
          average_rating?: number | null
          review_count?: number | null
          includes_pickup?: boolean | null
          pickup_locations?: string | null
          includes_meal?: boolean | null
          meal_description?: string | null
          name?: string | null
          requires_approval?: boolean
          instant_booking?: boolean | null
          cancellation_policy?: string | null
          base_price_thb?: number | null
          currency_code?: string | null
          country_code?: string | null
          created_by?: string | null
          updated_by?: string | null
          meeting_point_place_id?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_point_formatted_address?: string | null
          dropoff_location_place_id?: string | null
          dropoff_location_lat?: number | null
          dropoff_location_lng?: number | null
          dropoff_location_formatted_address?: string | null
          pickup_location_place_id?: string | null
          pickup_location_lat?: number | null
          pickup_location_lng?: number | null
          pickup_location_formatted_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "activity_owners"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "activities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_selected_options: {
        Row: {
          id: number
          activity_id: number | null
          option_id: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          activity_id?: number | null
          option_id?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          activity_id?: number | null
          option_id?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      activity_schedule_instances: {
        Row: {
          id: number
          schedule_id: number
          activity_id: number
          scheduled_date: string
          start_time: string
          end_time: string
          capacity: number
          booked_count: number | null
          price_override: number | null
          is_active: boolean | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          available_spots: number
          price: number
        }
        Insert: {
          id?: number
          schedule_id: number
          activity_id: number
          scheduled_date: string
          start_time: string
          end_time: string
          capacity?: number
          booked_count?: number | null
          price_override?: number | null
          is_active?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          available_spots?: number
          price?: number
        }
        Update: {
          id?: number
          schedule_id?: number
          activity_id?: number
          scheduled_date?: string
          start_time?: string
          end_time?: string
          capacity?: number
          booked_count?: number | null
          price_override?: number | null
          is_active?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          available_spots?: number
          price?: number
        }
        Relationships: []
      }
      activity_schedules: {
        Row: {
          id: number
          activity_id: number
          day_of_week: number
          start_time: string
          end_time: string
          max_participants: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          activity_id: number
          day_of_week: number
          start_time: string
          end_time: string
          max_participants?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          activity_id?: number
          day_of_week?: number
          start_time?: string
          end_time?: string
          max_participants?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_options: {
        Row: {
          id: number
          name: string
          description: string | null
          type: string
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          type: string
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          type?: string
          created_at?: string | null
        }
        Relationships: []
      }
      activity_owners: {
        Row: {
          id: string
          business_name: string
          email: string
          created_at: string
          commission_invoices: any[]
          owner_name?: string | null
          phone?: string | null
          business_type?: string | null
          tax_id?: string | null
          address?: string | null
          description?: string | null
          tourism_license_number?: string | null
          tat_license_number?: string | null
          guide_card_number?: string | null
          insurance_policy_number?: string | null
          insurance_coverage_amount?: number | null
          location?: any | null
          document_urls?: string[] | null
          approved?: string | null
          provider_id?: string | null
        }
        Insert: {
          id?: string
          business_name: string
          email: string
          created_at?: string
          commission_invoices?: any[]
          owner_name?: string | null
          phone?: string | null
          business_type?: string | null
          tax_id?: string | null
          address?: string | null
          description?: string | null
          tourism_license_number?: string | null
          tat_license_number?: string | null
          guide_card_number?: string | null
          insurance_policy_number?: string | null
          insurance_coverage_amount?: number | null
          location?: any | null
          document_urls?: string[] | null
          approved?: string | null
          provider_id?: string | null
        }
        Update: {
          id?: string
          business_name?: string
          email?: string
          created_at?: string
          commission_invoices?: any[]
          owner_name?: string | null
          phone?: string | null
          business_type?: string | null
          tax_id?: string | null
          address?: string | null
          description?: string | null
          tourism_license_number?: string | null
          tat_license_number?: string | null
          guide_card_number?: string | null
          insurance_policy_number?: string | null
          insurance_coverage_amount?: number | null
          location?: any | null
          document_urls?: string[] | null
          approved?: string | null
          provider_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          activity_id: number
          user_id: string
          status: string | null
          total_amount: number
          created_at: string
          activities: any | null
          provider_id: string | null
          booking_date: string
          total_price: number | null
          participants: number | null
          customer_name: string | null
          provider_amount: number | null
          platform_fee: number | null
        }
        Insert: {
          id?: string
          activity_id: number
          user_id: string
          status?: string | null
          total_amount: number
          created_at?: string
          activities?: any | null
          provider_id?: string | null
          booking_date?: string
          total_price?: number | null
          participants?: number | null
          customer_name?: string | null
          provider_amount?: number | null
          platform_fee?: number | null
        }
        Update: {
          id?: string
          activity_id?: number
          user_id?: string
          status?: string | null
          total_amount?: number
          created_at?: string
          activities?: any | null
          provider_id?: string | null
          booking_date?: string
          total_price?: number | null
          participants?: number | null
          customer_name?: string | null
          provider_amount?: number | null
          platform_fee?: number | null
        }
        Relationships: []
      }
      commission_invoices: {
        Row: {
          id: string
          invoice_number: string
          provider_id: string
          booking_id: string
          total_booking_amount: number
          platform_commission_amount: number
          invoice_status: string
          due_date: string
          stripe_payment_link_id: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          provider_id: string
          booking_id: string
          total_booking_amount: number
          platform_commission_amount: number
          invoice_status?: string
          due_date: string
          stripe_payment_link_id?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          provider_id?: string
          booking_id?: string
          total_booking_amount?: number
          platform_commission_amount?: number
          invoice_status?: string
          due_date?: string
          stripe_payment_link_id?: string | null
        }
        Relationships: []
      }
      commission_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          paid_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          paid_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          paid_at?: string
        }
        Relationships: []
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
          customer_id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          customer_id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          customer_id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      establishments: {
        Row: {
          id: string
          establishment_name: string
          establishment_type: string
          establishment_address: string
          partner_id: string
          room_count: number | null
          is_active: boolean
          created_at: string
          updated_at: string
          partner_registrations: any[]
        }
        Insert: {
          id?: string
          establishment_name: string
          establishment_type: string
          establishment_address: string
          partner_id: string
          room_count?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          partner_registrations?: any[]
        }
        Update: {
          id?: string
          establishment_name?: string
          establishment_type?: string
          establishment_address?: string
          partner_id?: string
          room_count?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          partner_registrations?: any[]
        }
        Relationships: []
      }
      establishment_activities: {
        Row: {
          id: string
          establishment_id: string
          activity_id: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          activity_id: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          activity_id?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      establishment_commissions: {
        Row: {
          id: string
          establishment_id: string
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          booking_id: string
          commission_amount: number
          commission_rate: number
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          booking_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string
        }
        Relationships: []
      }
      partner_registrations: {
        Row: {
          id: string
          user_id: string
          business_name: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude: number
          longitude: number
          place_id: string
          room_count: number
          commission_package: string
          supporting_documents: string[]
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude: number
          longitude: number
          place_id: string
          room_count: number
          commission_package: string
          supporting_documents: string[]
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          owner_name?: string
          email?: string
          phone?: string
          address?: string
          latitude?: number
          longitude?: number
          place_id?: string
          room_count?: number
          commission_package?: string
          supporting_documents?: string[]
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      qr_scans: {
        Row: {
          id: string
          establishment_id: string
          scanned_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          scanned_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          scanned_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message: string
          read_at: string | null
          created_at: string
          activity_id: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message: string
          read_at?: string | null
          created_at?: string
          activity_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          read_at?: string | null
          created_at?: string
          activity_id?: string | null
        }
        Relationships: []
      }
      stripe_checkout_sessions: {
        Row: {
          id: string
          stripe_session_id: string
          amount: number
          status: string
          customer_email: string
          created_at: string
        }
        Insert: {
          id?: string
          stripe_session_id: string
          amount: number
          status: string
          customer_email: string
          created_at?: string
        }
        Update: {
          id?: string
          stripe_session_id?: string
          amount?: number
          status?: string
          customer_email?: string
          created_at?: string
        }
        Relationships: []
      }
      stripe_transfers: {
        Row: {
          id: string
          recipient_id: string
          recipient_type: string
          amount: number
          status: string
          failure_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          recipient_type: string
          amount: number
          status: string
          failure_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          recipient_type?: string
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
          created_at: string
        }
        Insert: {
          id?: string
          stripe_event_id: string
          event_type: string
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          stripe_event_id?: string
          event_type?: string
          processed?: boolean
          created_at?: string
        }
        Relationships: []
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
