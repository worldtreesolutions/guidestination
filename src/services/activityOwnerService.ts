import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface ActivityOwner {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  description: string;
  website?: string;
  tax_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type ActivityOwnerFormData = Omit<ActivityOwner, 'id' | 'user_id' | 'is_verified' | 'created_at' | 'updated_at'>;

const activityOwnerService = {
  /**
   * Register a new activity owner
   */
  async register(data: ActivityOwnerFormData, userId: string): Promise<{ data: ActivityOwner | null; error: any }> {
    const { data: activityOwner, error } = await supabase
      .from('activity_owners')
      .insert([
        {
          user_id: userId,
          business_name: data.business_name,
          business_type: data.business_type,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          business_address: data.business_address,
          description: data.description,
          website: data.website || null,
          tax_id: data.tax_id || null,
          is_verified: false
        }
      ])
      .select('*')
      .single();

    return { data: activityOwner as ActivityOwner | null, error };
  },

  /**
   * Get activity owner by user ID
   */
  async getByUserId(userId: string): Promise<{ data: ActivityOwner | null; error: any }> {
    const { data, error } = await supabase
      .from('activity_owners')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data: data as ActivityOwner | null, error };
  },

  /**
   * Update activity owner details
   */
  async update(id: string, data: Partial<ActivityOwnerFormData>): Promise<{ data: ActivityOwner | null; error: any }> {
    const { data: updatedOwner, error } = await supabase
      .from('activity_owners')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    return { data: updatedOwner as ActivityOwner | null, error };
  },

  /**
   * Delete activity owner
   */
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('activity_owners')
      .delete()
      .eq('id', id);

    return { error };
  }
};

export default activityOwnerService;