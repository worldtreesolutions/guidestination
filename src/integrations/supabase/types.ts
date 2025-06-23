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
      activity_owners: {
        Row: {
          address: string | null
          business_name: string
          business_type: string | null
          created_at: string
          description: string | null
          email: string
          guide_card_number: string | null
          insurance_amount: string | null
          insurance_policy: string | null
          location_geom: unknown | null
          location_lat: number | null
          location_lng: number | null
          owner_name: string
          phone: string | null
          place_id: string | null
          provider_id: string
          status: string
          tat_license_number: string | null
          tax_id: string | null
          tourism_license_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          email: string
          guide_card_number?: string | null
          insurance_amount?: string | null
          insurance_policy?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          owner_name: string
          phone?: string | null
          place_id?: string | null
          provider_id?: string
          status?: string
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          description?: string | null
          email?: string
          guide_card_number?: string | null
          insurance_amount?: string | null
          insurance_policy?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          owner_name?: string
          phone?: string | null
          place_id?: string | null
          provider_id?: string
          status?: string
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activities: {
        Row: {
          title: string
          activity_id: number
          address: string | null
          category_id: number | null
          created_at: string
          description: string | null
          duration: number | null
          includes_hotel_pickup: boolean | null
          language: string | null
          location_geom: unknown | null
          location_lat: number | null
          location_lng: number | null
          pickup_location: string | null
          dropoff_location: string | null
          meeting_point: string | null
          languages: string | null
          highlights: string | null
          included: string | null
          not_included: string | null
          max_participants: number | null
          min_participants: number | null
          min_age: number | null
          max_age: number | null
          name: string
          image_url: Json | null
          place_id: string | null
          b_price: number
          final_price: number | null // Corrected: was final_price: number
          discounts: number | null
          provider_id: string | null
          rating: number | null
          status: number | null
          is_active: boolean | null
          tags: string[] | null
          type: string | null
          Final_Price: number | null // This is likely the one used, ensure consistency
          id: number // This is the primary key
          user_id: string | null
        }
        Insert: {
          title?: string
          activity_id?: number
          address?: string | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          includes_hotel_pickup?: boolean | null
          language?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          pickup_location?: string | null
          dropoff_location?: string | null
          meeting_point?: string | null
          languages?: string | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          max_participants?: number | null
          min_participants?: number | null
          min_age?: number | null
          max_age?: number | null
          name?: string
          image_url?: Json | null
          place_id?: string | null
          b_price?: number
          final_price?: number | null
          discounts?: number | null
          provider_id?: string | null
          rating?: number | null
          status?: number | null
          is_active?: boolean | null
          tags?: string[] | null
          type?: string | null
          Final_Price?: number | null
          id?: number
          user_id?: string | null
        }
        Update: {
          title?: string
          activity_id?: number
          address?: string | null
          category_id?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          includes_hotel_pickup?: boolean | null
          language?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          pickup_location?: string | null
          dropoff_location?: string | null
          meeting_point?: string | null
          languages?: string | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          max_participants?: number | null
          min_participants?: number | null
          min_age?: number | null
          max_age?: number | null
          name?: string
          image_url?: Json | null
          place_id?: string | null
          b_price?: number
          final_price?: number | null
          discounts?: number | null
          provider_id?: string | null
          rating?: number | null
          status?: number | null
          is_active?: boolean | null
          tags?: string[] | null
          type?: string | null
          Final_Price?: number | null
          id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          activity_id: string | null // Should be number to match activities.id or activities.activity_id
          booking_date: string
          booking_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          notes: string | null
          number_of_participants: number
          payment_status: string | null
          provider_id: string | null
          status: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          booking_date: string
          booking_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          number_of_participants: number
          payment_status?: string | null
          provider_id?: string | null
          status?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          booking_date?: string
          booking_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          notes?: string | null
          number_of_participants?: number
          payment_status?: string | null
          provider_id?: string | null
          status?: string | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          // Assuming activity_id in bookings refers to activities.id (PK, type number)
          // If it refers to activities.activity_id (type number), this is also fine.
          // The current type 'string | null' for bookings.activity_id is problematic if activities.id is number.
          // For now, I will keep it as string as per existing definition, but this might need review.
          {
            foreignKeyName: "bookings_activity_id_fkey" // This FK might be on activities.activity_id or activities.id
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"] // Or "activity_id" depending on actual DB schema
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "activity_owners"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: number // Changed from string to number
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          id?: number // Changed from string to number
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          id?: number // Changed from string to number
          created_at?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          hotel_id: string
          location_geom: unknown | null
          location_lat: number | null
          location_lng: number | null
          name: string
          photos: Json | null
          place_id: string | null
          rating: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          photos?: Json | null
          place_id?: string | null
          rating?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          hotel_id?: string
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          photos?: Json | null
          place_id?: string | null
          rating?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean | null
          message: string | null
          recipient_user_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean | null
          message?: string | null
          recipient_user_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean | null
          message?: string | null
          recipient_user_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: { // This seems to be a duplicate or alternative to partner_registrations
        Row: {
          address: string | null
          commission_package: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          partner_id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          commission_package?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          partner_id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          commission_package?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          partner_id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_schedules: {
        Row: {
          id: number
          activity_id: number // FK to activities.id or activities.activity_id
          created_at: string
          start_time: string
          end_time: string
          capacity: number
          created_by: string | null
          updated_by: string | null
          availability_start_date: string | null
          availability_end_date: string | null
          is_active: boolean | null
          status: string | null
        }
        Insert: {
          id?: never
          activity_id: number
          created_at?: string
          start_time: string
          end_time: string
          capacity: number
          created_by?: string | null
          updated_by?: string | null
          availability_start_date?: string | null
          availability_end_date?: string | null
          is_active?: boolean | null
          status?: string | null
        }
        Update: {
          id?: number
          activity_id?: number
          created_at?: string
          start_time?: string
          end_time?: string
          capacity?: number
          created_by?: string | null
          updated_by?: string | null
          availability_start_date?: string | null
          availability_end_date?: string | null
          is_active?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_schedules_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false // Assuming one activity can have multiple schedules
            referencedRelation: "activities"
            referencedColumns: ["id"] // Or "activity_id"
          },
           {
            foreignKeyName: "activity_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_schedules_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      partner_registrations: {
        Row: {
          id: string
          user_id: string | null
          business_name: string
          business_type: string
          hotel_license_number: string
          tourism_license_number: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude: number | null
          longitude: number | null
          place_id: string | null
          room_count: number
          tax_id: string
          commission_package: "basic" | "premium"
          supporting_documents: Json | null
          status: "pending" | "approved" | "rejected"
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          business_name: string
          business_type: string
          hotel_license_number: string
          tourism_license_number: string
          owner_name: string
          email: string
          phone: string
          address: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          room_count: number
          tax_id: string
          commission_package: "basic" | "premium"
          supporting_documents?: Json | null
          status?: "pending" | "approved" | "rejected"
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          business_name?: string
          business_type?: string
          hotel_license_number?: string
          tourism_license_number?: string
          owner_name?: string
          email?: string
          phone?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          room_count?: number
          tax_id?: string
          commission_package?: "basic" | "premium"
          supporting_documents?: Json | null
          status?: "pending" | "approved" | "rejected"
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_registrations_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      partner_activities: {
        Row: {
          id: string
          partner_id: string
          activity_id: number // FK to activities.id
          commission_rate: number | null
          is_active: boolean | null
          created_by: string | null // Added
          updated_by: string | null // Added
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          activity_id: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: string | null // Added
          updated_by?: string | null // Added
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          activity_id?: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: string | null // Added
          updated_by?: string | null // Added
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_activities_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"] // Assuming FK is to activities.id (PK)
          },
          {
            foreignKeyName: "partner_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_activities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      establishments: {
        Row: {
          id: string
          partner_id: string
          establishment_type: string
          establishment_name: string
          establishment_address: string
          room_count: number
          supporting_docs: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          partner_id: string
          establishment_type: string
          establishment_name: string
          establishment_address: string
          room_count?: number
          supporting_docs?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          partner_id?: string
          establishment_type?: string
          establishment_name?: string
          establishment_address?: string
          room_count?: number
          supporting_docs?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "establishments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      establishment_activities: {
        Row: {
          id: string
          establishment_id: string
          activity_id: number
          commission_rate: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          establishment_id: string
          activity_id: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          establishment_id?: string
          activity_id?: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "establishment_activities_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_activities_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
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
    : never = never,
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
    : never = never,
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
    : never = never,
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
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
