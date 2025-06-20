
import { supabase } from "@/integrations/supabase/client"

export interface PartnerRegistration {
  id?: string
  business_name: string
  business_type: string
  hotel_license_number: string
  tourism_license_number: string
  owner_name: string
  email: string
  phone: string
  address: string
  latitude?: number
  longitude?: number
  place_id?: string
  room_count: number
  tax_id: string
  commission_package: "basic" | "premium"
  supporting_documents?: string[]
  status?: "pending" | "approved" | "rejected"
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export const partnerService = {
  async createPartnerRegistration(data: Omit<PartnerRegistration, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">) {
    const { data: result, error } = await supabase
      .from("partner_registrations" as any)
      .insert([{
        business_name: data.business_name,
        business_type: data.business_type,
        hotel_license_number: data.hotel_license_number,
        tourism_license_number: data.tourism_license_number,
        owner_name: data.owner_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        place_id: data.place_id,
        room_count: data.room_count,
        tax_id: data.tax_id,
        commission_package: data.commission_package,
        supporting_documents: data.supporting_documents || []
      }])
      .select()

    if (error) throw error
    return result[0] as any
  },

  async uploadSupportingDocument(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `partner-documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from("uploads")
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  async getPartnerRegistrations() {
    const { data, error } = await supabase
      .from("partner_registrations" as any)
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as any[]
  },

  async getPartnerRegistrationByEmail(email: string) {
    const { data, error } = await supabase
      .from("partner_registrations" as any)
      .select("*")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data as any
  }
}

export default partnerService
