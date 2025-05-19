
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
          provider_id: UUID
          status: string | null
          tat_license_number: string | null
          tax_id: string | null
          tourism_license_number: string | null
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
          provider_id?: UUID
          status?: string | null
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
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
          provider_id?: UUID
          status?: string | null
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
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
          activity_id: string
          address: string | null
          category: string | null
          created_at: string
          description: string | null
          duration: number | null
          includes_hotel_pickup: boolean | null
          language: string | null
          location_geom: unknown | null
          location_lat: number | null
          location_lng: number | null
          max_participants: number | null
          min_participants: number | null
          name: string
          photos: Json | null
          place_id: string | null
          price: number
          provider_id: UUID
          rating: number | null
          status: string | null
          tags: string[] | null
          type: string | null
        }
        Insert: {
          activity_id?: string
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          includes_hotel_pickup?: boolean | null
          language?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          min_participants?: number | null
          name: string
          photos?: Json | null
          place_id?: string | null
          price: number
          provider_id?: UUID
          rating?: number | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Update: {
          activity_id?: string
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          duration?: number | null
          includes_hotel_pickup?: boolean | null
          language?: string | null
          location_geom?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          max_participants?: number | null
          min_participants?: number | null
          name?: string
          photos?: Json | null
          place_id?: string | null
          price?: number
          provider_id?: UUID
          rating?: number | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "activity_owners"
            referencedColumns: ["provider_id"]
          },
        ]
      }
      bookings: {
        Row: {
          activity_id: string | null
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
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["activity_id"]
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
          category_id: string
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          category_id?: string
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          category_id?: string
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
      partners: {
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
