Need to install the following packages:
supabase@2.26.9
Ok to proceed? (y) 
      partner_activities: {
        Row: {
          id: string
          partner_id: string
          activity_id: number
          commission_rate: number | null
          is_active: boolean | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          activity_id: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          activity_id?: number
          commission_rate?: number | null
          is_active?: boolean | null
          created_by?: string | null
          updated_by?: string | null
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
            referencedColumns: ["id"]
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
