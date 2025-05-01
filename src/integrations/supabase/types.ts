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
      activity_owners: {
        Row: {
          address: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          description: string | null
          email: string | null
          guide_card_number: string | null
          id: string
          insurance_amount: string | null
          insurance_policy: string | null
          owner_name: string | null
          phone: string | null
          status: string | null
          tat_license_number: string | null
          tax_id: string | null
          tourism_license_number: string | null
          updated_at: string | null
          user_id: string | null // Should ideally be number if users.id is number, check DB schema
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          guide_card_number?: string | null
          id?: string
          insurance_amount?: string | null
          insurance_policy?: string | null
          owner_name?: string | null
          phone?: string | null
          status?: string | null
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
          updated_at?: string | null
          user_id?: string | null // Should ideally be number if users.id is number
        }
        Update: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          guide_card_number?: string | null
          id?: string
          insurance_amount?: string | null
          insurance_policy?: string | null
          owner_name?: string | null
          phone?: string | null
          status?: string | null
          tat_license_number?: string | null
          tax_id?: string | null
          tourism_license_number?: string | null
          updated_at?: string | null
          user_id?: string | null // Should ideally be number if users.id is number
        }
        Relationships: [
          {
            foreignKeyName: "activity_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"] // Ensure users.id type matches user_id type
          },
        ]
      }
      users: { // Added users table definition
        Row: {
          id: number // Assuming id is integer based on previous errors
          name: string
          email: string
          phone: string | null
          user_type: string | null
          verified: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone?: string | null
          user_type?: string | null
          verified?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string | null
          user_type?: string | null
          verified?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_verifications: { // Added email_verifications table definition
        Row: {
          id: number // Assuming id is integer
          user_id: number // Assuming user_id is integer
          token: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          token: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          token?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verifications_user_id_fkey" // Assuming FK name
            columns: ["user_id"]
            isOneToOne: false // Assuming one-to-many
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