
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Establishment = Database["public"]["Tables"]["establishments"]["Row"];
type EstablishmentInsert = Database["public"]["Tables"]["establishments"]["Insert"];
type EstablishmentUpdate = Database["public"]["Tables"]["establishments"]["Update"];

export const establishmentService = {
  async getEstablishmentsByPartnerId(partnerId: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(`
        *,
        partner_registrations!inner(
          business_name,
          owner_name,
          email
        )
      `)
      .eq("partner_id", partnerId)
      .eq("is_active", true);

    if (error) throw error;
    return data as Establishment[];
  },

  async getEstablishmentById(id: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(`
        *,
        partner_registrations!inner(
          business_name,
          owner_name,
          email,
          phone
        ),
        establishment_activities(
          id,
          activity_id,
          commission_rate,
          is_active,
          activities(
            id,
            title,
            description,
            b_price,
            final_price
          )
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createEstablishment(establishment: EstablishmentInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishments")
      .insert({
        ...establishment,
        created_by: user?.id,
        updated_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as Establishment;
  },

  async updateEstablishment(id: string, updates: EstablishmentUpdate) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishments")
      .update({
        ...updates,
        updated_by: user?.id
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Establishment;
  },

  async deleteEstablishment(id: string) {
    const { error } = await supabase
      .from("establishments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async getEstablishmentsByUserId(userId: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(`
        *,
        partner_registrations!inner(
          business_name,
          owner_name,
          user_id
        )
      `)
      .eq("partner_registrations.user_id", userId);

    if (error) throw error;
    return data as Establishment[];
  }
};

export default establishmentService;
