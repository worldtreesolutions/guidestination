
    
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
          },
        ]
      }
      activity_owners: {
        Row: {
          id: string
          user_id: string
          email: string
          business_name: string | null
          created_at: string
          updated_at: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          provider_id: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          business_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          provider_id: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          business_name?: string | null
          created_at?: string
          updated_at?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          provider_id?: string
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
          id: number
          activity_id: number | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          booking_date: string | null
          status: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          total_amount: number | null
          referral_visit_id: string | null
          booking_source: string | null
          establishment_id: string | null
          customer_id: string | null
          participants: number | null
          updated_by: string | null
          is_qr_booking: boolean | null
          qr_establishment_id: string | null
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          commission_invoice_generated: boolean | null
        }
        Insert: {
          id?: number
          activity_id?: number | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          booking_date?: string | null
          status?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          total_amount?: number | null
          referral_visit_id?: string | null
          booking_source?: string | null
          establishment_id?: string | null
          customer_id?: string | null
          participants?: number | null
          updated_by?: string | null
          is_qr_booking?: boolean | null
          qr_establishment_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          commission_invoice_generated?: boolean | null
        }
        Update: {
          id?: number
          activity_id?: number | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          booking_date?: string | null
          status?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          total_amount?: number | null
          referral_visit_id?: string | null
          booking_source?: string | null
          establishment_id?: string | null
          customer_id?: string | null
          participants?: number | null
          updated_by?: string | null
          is_qr_booking?: boolean | null
          qr_establishment_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          commission_invoice_generated?: boolean | null
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
            referencedRelation: "customers"
            referencedColumns: ["cus_id"]
          },
          {
            foreignKeyName: "bookings_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_qr_establishment_id_fkey"
            columns: ["qr_establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_referral_visit_id_fkey"
            columns: ["referral_visit_id"]
            referencedRelation: "referral_visits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_updated_by_fkey"
            columns: ["updated_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          activity_id: number
          message: string
          sender_type: string
          created_at: string | null
          read_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          activity_id: number
          message: string
          sender_type: string
          created_at?: string | null
          read_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          activity_id?: number
          message?: string
          sender_type?: string
          created_at?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
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
      commission_invoices: {
        Row: {
          id: string
          booking_id: number
          provider_id: string
          invoice_number: string
          total_booking_amount: number
          platform_commission_rate: number
          platform_commission_amount: number
          partner_commission_rate: number | null
          partner_commission_amount: number | null
          establishment_id: string | null
          is_qr_booking: boolean
          invoice_status: "pending" | "paid" | "overdue" | "cancelled"
          due_date: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          stripe_payment_link_id: string | null
          stripe_payment_link_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: number
          provider_id: string
          invoice_number: string
          total_booking_amount: number
          platform_commission_rate: number
          platform_commission_amount: number
          partner_commission_rate?: number | null
          partner_commission_amount?: number | null
          establishment_id?: string | null
          is_qr_booking?: boolean
          invoice_status?: "pending" | "paid" | "overdue" | "cancelled"
          due_date: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: number
          provider_id?: string
          invoice_number?: string
          total_booking_amount?: number
          platform_commission_rate?: number
          platform_commission_amount?: number
          partner_commission_rate?: number | null
          partner_commission_amount?: number | null
          establishment_id?: string | null
          is_qr_booking?: boolean
          invoice_status?: "pending" | "paid" | "overdue" | "cancelled"
          due_date?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          stripe_payment_link_id?: string | null
          stripe_payment_link_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_invoices_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoices_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoices_provider_id_fkey"
            columns: ["provider_id"]
            referencedRelation: "activity_owners"
            referencedColumns: ["id"]
          }
        ]
      }
      commission_payments: {
        Row: {
          id: string
          invoice_id: string
          payment_amount: number
          payment_method: string
          payment_status: "pending" | "completed" | "failed"
          payment_reference: string | null
          stripe_payment_intent_id: string | null
          paid_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          payment_amount: number
          payment_method: string
          payment_status?: "pending" | "completed" | "failed"
          payment_reference?: string | null
          stripe_payment_intent_id?: string | null
          paid_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          payment_amount?: number
          payment_method?: string
          payment_status?: "pending" | "completed" | "failed"
          payment_reference?: string | null
          stripe_payment_intent_id?: string | null
          paid_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "commission_invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      customer_profiles: {
        Row: {
          customer_id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          customer_id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          customer_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
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
          booking_id: number
          activity_id: number
          referral_visit_id: string | null
          commission_rate: number
          booking_amount: number
          commission_amount: number
          commission_status: "pending" | "paid" | "cancelled"
          booking_source: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          booking_id: number
          activity_id: number
          referral_visit_id?: string | null
          commission_rate: number
          booking_amount: number
          commission_amount: number
          commission_status?: "pending" | "paid" | "cancelled"
          booking_source?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          booking_id?: number
          activity_id?: number
          referral_visit_id?: string | null
          commission_rate?: number
          booking_amount?: number
          commission_amount?: number
          commission_status?: "pending" | "paid" | "cancelled"
          booking_source?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_commissions_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
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
          verification_status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          name: string
          address: string
          verification_status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          name?: string
          address?: string
          verification_status?: "pending" | "approved" | "rejected"
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
      qr_scans: {
        Row: {
          id: string
          establishment_id: string
          user_agent: string | null
          meta Json | null
          created_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      referral_visits: {
        Row: {
          id: string
          establishment_id: string
          session_id: string
          user_agent: string | null
          meta Json | null
          visit_date: string
        }
        Insert: {
          id?: string
          establishment_id: string
          session_id: string
          user_agent?: string | null
          metadata?: Json | null
          visit_date?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          session_id?: string
          user_agent?: string | null
          metadata?: Json | null
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
          error_message: string | null
        }
        Insert: {
          id?: string
          stripe_event_id: string
          event_type: string
          processed?: boolean
          payload: Json
          created_at?: string
          error_message?: string | null
        }
        Update: {
          id?: string
          stripe_event_id?: string
          event_type?: string
          processed?: boolean
          payload?: Json
          created_at?: string
          error_message?: string | null
        }
        Relationships: []
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
            foreignKeyName: "wishlist_activity_id_fkey"
            columns: ["activity_id"]
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customer_profiles"
            referencedColumns: ["customer_id"]
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
        Relationships: [
          {
            foreignKeyName: "activity_selected_options_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_selected_options_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "activity_options"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "activity_schedule_instances_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_schedule_instances_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "activity_schedules"
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
  