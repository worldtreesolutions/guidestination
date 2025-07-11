import { supabase } from "@/integrations/supabase/client";
import type { PostgrestResponse } from "@supabase/supabase-js";
import type { Activity } from "@/types/activity";

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return [];
    }
    
    const result = await supabase.from("categories").select("*");
    if (result.error) {
      console.error("Error fetching categories:", result.error.message);
      throw result.error;
    }
    return (result.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }));
  },

  async getCategoryById(id: string): Promise<Category | null> {
    if (!supabase) {
      const err = { message: "Supabase client not initialized", details: "Check environment variables", hint: "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set", code: "CLIENT_ERROR" };
      console.error(err.message, err.details);
      return null;
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = { message: "Invalid category ID format. ID must be a number.", details: `Received: ${id}`, hint: "Ensure ID is a numeric string.", code: "22P02" };
      console.error(err.message, err.details);
      return null;
    }

    const result = await supabase
      .from("categories")
      .select("*")
      .eq("id", numericId)
      .single();

    if (result.error && result.error.code !== "PGRST116") { 
      console.error(`Error fetching category with ID ${numericId}:`, result.error.message);
      return null;
    }
    
    const d = result.data as any;
    const categoryData = d ? {
      id: d.id,
      name: d.name,
      description: d.description || undefined,
      image_url: d.image_url || undefined,
      created_at: d.created_at || undefined,
      updated_at: d.updated_at || undefined,
    } : null;
    
    return categoryData as Category | null;
  },

  async getActivitiesByCategoryId(categoryId: number): Promise<{ activities: Activity[] | null; error: any | null }> {
    if (!supabase) {
      const err = { message: "Supabase client not initialized", details: "Check environment variables", hint: "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set", code: "CLIENT_ERROR" };
      console.error(err.message, err.details);
      return { activities: null, error: err };
    }

    const result = await supabase
      .from("activities")
      .select("*")
      .eq("category_id", categoryId);

    if (result.error) {
      console.error(`Error fetching activities for category ID ${categoryId}:`, result.error.message);
      return { activities: null, error: result.error };
    }
    
    return { activities: result.data, error: null };
  },

  async getCategory(id: number): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Category not found");

    return data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await supabase.from("categories").select("*");
    if (response.error) {
      throw response.error;
    }
    if (!response.data) {
      return [];
    }

    // Sort categories by creation date, newest first
    const sortedCategories = (response.data as any[]).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image_url: c.image_url,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  },

  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select();

    if (error) throw error;

    return data;
  },

  async updateCategory(
    id: number,
    updates: Partial<Omit<Category, "id" | "created_at" | "updated_at">>
  ) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data;
  },
};

export default categoryService;
  
