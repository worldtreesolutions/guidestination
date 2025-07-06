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
          room_count: number
          commission_package: "basic" | "premium"
          supporting_documents: string[] | null
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
          owner_name: string
          email: string
          phone: string
          address: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          room_count: number
          commission_package: "basic" | "premium"
          supporting_documents?: string[] | null
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
          owner_name?: string
          email?: string
          phone?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          room_count?: number
          commission_package?: "basic" | "premium"
          supporting_documents?: string[] | null
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
          room_count: number | null
          supporting_docs: string[] | null
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
          room_count?: number | null
          supporting_docs?: string[] | null
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
          room_count?: number | null
          supporting_docs?: string[] | null
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
          }
        ]
      }
      establishment_activities: {
        Row: {
          id: string
          establishment_id: string
          activity_id: number
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          activity_id: number
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          activity_id?: number
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      activities: {
        Row: {
          id: number
          activity_id: number
          title: string
          name: string
          description: string
          final_price: number
          price: number
          b_price: number
          Final_Price: number
          category_id: number
          is_active: boolean
          status: "draft" | "published" | "archived"
          duration: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          activity_id?: number
          title: string
          name?: string
          description: string
          final_price: number
          price?: number
          b_price?: number
          Final_Price?: number
          category_id: number
          is_active?: boolean
          status?: "draft" | "published" | "archived"
          duration?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          activity_id?: number
          title?: string
          name?: string
          description?: string
          final_price?: number
          price?: number
          b_price?: number
          Final_Price?: number
          category_id?: number
          is_active?: boolean
          status?: "draft" | "published" | "archived"
          duration?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activity_owners: {
        Row: {
          id: string
          provider_id: string
          user_id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          user_id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          user_id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_profiles: {
        Row: {
          id: string
          user_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist: {
        Row: {
          id: string
          customer_id: string
          activity_id: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          activity_id: number
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          activity_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          }
        ]
      }
      referral_visits: {
        Row: {
          id: string
          establishment_id: string
          visitor_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer_url: string | null
          visited_at: string
          metadata: any
        }
        Insert: {
          id?: string
          establishment_id: string
          visitor_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer_url?: string | null
          visited_at?: string
          metadata?: any
        }
        Update: {
          id?: string
          establishment_id?: string
          visitor_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer_url?: string | null
          visited_at?: string
          metadata?: any
        }
        Relationships: [
          {
            foreignKeyName: "referral_visits_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      establishment_commissions: {
        Row: {
          id: string
          establishment_id: string
          booking_id: string | null
          activity_id: number
          customer_id: string
          referral_visit_id: string | null
          commission_rate: number
          booking_amount: number
          commission_amount: number
          commission_status: string
          booking_source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          booking_id?: string | null
          activity_id: number
          customer_id: string
          referral_visit_id?: string | null
          commission_rate?: number
          booking_amount: number
          commission_amount: number
          commission_status?: string
          booking_source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          booking_id?: string | null
          activity_id?: number
          customer_id?: string
          referral_visit_id?: string | null
          commission_rate?: number
          booking_amount?: number
          commission_amount?: number
          commission_status?: string
          booking_source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_commissions_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "establishment_commissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
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
