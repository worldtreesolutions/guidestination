import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type EstablishmentActivity = Database["public"]["Tables"]["establishment_activities"]["Row"];
type EstablishmentActivityInsert = Database["public"]["Tables"]["establishment_activities"]["Insert"];
type EstablishmentActivityUpdate = Database["public"]["Tables"]["establishment_activities"]["Update"];

export const establishmentActivityService = {
  async getActivitiesByEstablishmentId(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishment_activities")
      .select(`
        *,
        activities!inner(
          id,
          title,
          description,
          b_price,
          final_price,
          image_url,
          duration,
          max_participants,
          categories(name)
        )
      `)
      .eq("establishment_id", establishmentId)
      .eq("is_active", true);

    if (error) throw error;
    return data;
  },

  async getEstablishmentsByActivityId(activityId: number) {
    const { data, error } = await supabase
      .from("establishment_activities")
      .select(`
        *,
        establishments!inner(
          id,
          establishment_name,
          establishment_type,
          establishment_address,
          room_count,
          partner_registrations(
            business_name,
            owner_name,
            email,
            phone
          )
        )
      `)
      .eq("activity_id", activityId)
      .eq("is_active", true);

    if (error) throw error;
    return data;
  },

  async linkActivityToEstablishment(establishmentActivity: EstablishmentActivityInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishment_activities")
      .insert({
        ...establishmentActivity,
        created_by: user?.id,
        updated_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as EstablishmentActivity;
  },

  async updateEstablishmentActivity(id: string, updates: EstablishmentActivityUpdate) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishment_activities")
      .update({
        ...updates,
        updated_by: user?.id
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as EstablishmentActivity;
  },

  async unlinkActivityFromEstablishment(establishmentId: string, activityId: number) {
    const { error } = await supabase
      .from("establishment_activities")
      .delete()
      .eq("establishment_id", establishmentId)
      .eq("activity_id", activityId);

    if (error) throw error;
    return true;
  },

  async updateCommissionRate(establishmentId: string, activityId: number, commissionRate: number) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishment_activities")
      .update({
        commission_rate: commissionRate,
        updated_by: user?.id
      } as any)
      .eq("establishment_id", establishmentId)
      .eq("activity_id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data as EstablishmentActivity;
  },

  async toggleActivityStatus(establishmentId: string, activityId: number, isActive: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("establishment_activities")
      .update({
        is_active: isActive,
        updated_by: user?.id
      } as any)
      .eq("establishment_id", establishmentId)
      .eq("activity_id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data as EstablishmentActivity;
  }
};

export default establishmentActivityService;
