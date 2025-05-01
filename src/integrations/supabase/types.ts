
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
          provider_id: number | null
          category_id: number | null
          title: string
          description: string | null
          image_url: string | null
          pickup_location: string
          dropoff_location: string
          duration: string
          price: number
          discounts: number | null
          max_participants: number | null
          highlights: string | null
          included: string | null
          not_included: string | null
          meeting_point: string | null
          languages: string | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
          b_price: number | null
          status: number | null
        }
        Insert: {
          id?: number
          provider_id?: number | null
          category_id?: number | null
          title: string
          description?: string | null
          image_url?: string | null
          pickup_location: string
          dropoff_location: string
          duration: string
          price: number
          discounts?: number | null
          max_participants?: number | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          meeting_point?: string | null
          languages?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
          b_price?: number | null
          status?: number | null
        }
        Update: {
          id?: number
          provider_id?: number | null
          category_id?: number | null
          title?: string
          description?: string | null
          image_url?: string | null
          pickup_location?: string
          dropoff_location?: string
          duration?: string
          price?: number
          discounts?: number | null
          max_participants?: number | null
          highlights?: string | null
          included?: string | null
          not_included?: string | null
          meeting_point?: string | null
          languages?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
          b_price?: number | null
          status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_provider_id_fkey"
            columns: ["provider_id"]
            referencedRelation: "activity_providers"
            referencedColumns: ["id"]
          }
        ]
      },
      activity_owners: {
        Row: {
          id: string
          business_name: string
          owner_name: string
          email: string
          phone: string
          business_type: string
          tax_id: string
          address: string
          description: string
          tourism_license_number: string
          tat_license_number: string | null
          guide_card_number: string | null
          insurance_policy: string
          insurance_amount: string
          created_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          id?: string
          business_name: string
          owner_name: string
          email: string
          phone: string
          business_type: string
          tax_id: string
          address: string
          description: string
          tourism_license_number: string
          tat_license_number?: string | null
          guide_card_number?: string | null
          insurance_policy: string
          insurance_amount: string
          created_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          business_name?: string
          owner_name?: string
          email?: string
          phone?: string
          business_type?: string
          tax_id?: string
          address?: string
          description?: string
          tourism_license_number?: string
          tat_license_number?: string | null
          guide_card_number?: string | null
          insurance_policy?: string
          insurance_amount?: string
          created_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_owners_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      },
      activity_providers: {
        Row: {
          id: number
          user_id: number | null
          business_name: string
          business_type: string
          tourism_license_number: string
          tat_license_number: string | null
          owner_name: string
          owner_email: string
          phone: string
          address: string
          insurance_policy_number: string
          insurance_coverage_amount: number
          professional_guide_card_number: string
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          business_name: string
          business_type: string
          tourism_license_number: string
          tat_license_number?: string | null
          owner_name: string
          owner_email: string
          phone: string
          address: string
          insurance_policy_number: string
          insurance_coverage_amount: number
          professional_guide_card_number: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          business_name?: string
          business_type?: string
          tourism_license_number?: string
          tat_license_number?: string | null
          owner_name?: string
          owner_email?: string
          phone?: string
          address?: string
          insurance_policy_number?: string
          insurance_coverage_amount?: number
          professional_guide_card_number?: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      activity_schedules: {
        Row: {
          id: number
          activity_id: number | null
          start_time: string
          end_time: string
          capacity: number
          booked_count: number | null
          recurrence_pattern: string | null
          recurrence_interval: number | null
          recurrence_day_of_week: string | null
          availability_start_date: string | null
          availability_end_date: string | null
          price_override: number | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
          status: string | null
        }
        Insert: {
          id?: number
          activity_id?: number | null
          start_time: string
          end_time: string
          capacity: number
          booked_count?: number | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day_of_week?: string | null
          availability_start_date?: string | null
          availability_end_date?: string | null
          price_override?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
        }
        Update: {
          id?: number
          activity_id?: number | null
          start_time?: string
          end_time?: string
          capacity?: number
          booked_count?: number | null
          recurrence_pattern?: string | null
          recurrence_interval?: number | null
          recurrence_day_of_week?: string | null
          availability_start_date?: string | null
          availability_end_date?: string | null
          price_override?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_schedules_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          }
        ]
      },
      bookings: {
        Row: {
          id: number
          activity_id: number | null
          hotel_id: number | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          booking_date: string | null
          status: string | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          activity_id?: number | null
          hotel_id?: number | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          booking_date?: string | null
          status?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          activity_id?: number | null
          hotel_id?: number | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          booking_date?: string | null
          status?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      },
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      commissions: {
        Row: {
          id: number
          booking_id: number | null
          hotel_id: number | null
          commission_amount: number
          paid: boolean | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          booking_id?: number | null
          hotel_id?: number | null
          commission_amount: number
          paid?: boolean | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          booking_id?: number | null
          hotel_id?: number | null
          commission_amount?: number
          paid?: boolean | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      },
      customers: {
        Row: {
          id: number
          user_id: number | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      email_verifications: {
        Row: {
          id: number
          user_id: number | null
          token: string
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          token: string
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          token?: string
          created_at?: string | null
        }
        Relationships: []
      },
      hotel_activity_provider_links: {
        Row: {
          id: number
          hotel_id: number | null
          activity_provider_id: number | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          hotel_id?: number | null
          activity_provider_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          hotel_id?: number | null
          activity_provider_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_activity_provider_links_activity_provider_id_fkey"
            columns: ["activity_provider_id"]
            referencedRelation: "activity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_activity_provider_links_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      },
      hotels: {
        Row: {
          id: number
          user_id: number | null
          business_name: string
          business_type: string
          hotel_license_number: string
          tourism_business_license_number: string
          tax_id: string
          address: string
          commission_rate: number | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          business_name: string
          business_type: string
          hotel_license_number: string
          tourism_business_license_number: string
          tax_id: string
          address: string
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          business_name?: string
          business_type?: string
          hotel_license_number?: string
          tourism_business_license_number?: string
          tax_id?: string
          address?: string
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      role_permissions: {
        Row: {
          id: number
          role_id: number | null
          permission_name: string
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          role_id?: number | null
          permission_name: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          role_id?: number | null
          permission_name?: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      },
      roles: {
        Row: {
          id: number
          name: string
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      staff: {
        Row: {
          id: number
          user_id: number | null
          staff_type: string
          hotel_id: number | null
          provider_id: number | null
          role_id: number | null
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id?: number | null
          staff_type: string
          hotel_id?: number | null
          provider_id?: number | null
          role_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: number | null
          staff_type?: string
          hotel_id?: number | null
          provider_id?: number | null
          role_id?: number | null
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_provider_id_fkey"
            columns: ["provider_id"]
            referencedRelation: "activity_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
      },
      staff_roles: {
        Row: {
          id: number
          role_name: string
          is_active: boolean | null
          created_by: number | null
          updated_by: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          role_name: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          role_name?: string
          is_active?: boolean | null
          created_by?: number | null
          updated_by?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      users: {
        Row: {
          id: number
          name: string
          email: string
          password_hash: string | null
          phone: string | null
          user_type: string | null
          created_at: string | null
          role_id: number | null
          verified: boolean
        }
        Insert: {
          id?: number
          name: string
          email: string
          password_hash?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string | null
          role_id?: number | null
          verified: boolean
        }
        Update: {
          id?: number
          name?: string
          email?: string
          password_hash?: string | null
          phone?: string | null
          user_type?: string | null
          created_at?: string | null
          role_id?: number | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "roles"
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
