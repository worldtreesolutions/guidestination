
import { supabase } from "@/integrations/supabase/client";
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
    
    const { data, error }: any = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
      throw error;
    }
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      image_url: item.image_url || undefined,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString()
    }));
  },

  async getCategoryById(id: string): Promise<Category | null> {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      console.error("Invalid category ID format. ID must be a number.");
      return null;
    }

    const { data, error }: any = await supabase
      .from("categories")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error && error.code !== "PGRST116") { 
      console.error(`Error fetching category with ID ${numericId}:`, error.message);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
    };
  },

  async getActivitiesByCategoryId(categoryId: number): Promise<{ activities: Activity[] | null; error: any | null }> {
    if (!supabase) {
      const err = { message: "Supabase client not initialized" };
      console.error(err.message);
      return { activities: null, error: err };
    }

    const { data, error }: any = await supabase
      .from("activities")
      .select("*")
      .eq("category_id", categoryId);

    if (error) {
      console.error(`Error fetching activities for category ID ${categoryId}:`, error.message);
      return { activities: null, error };
    }
    
    return { activities: data, error: null };
  },

  async getCategory(id: number): Promise<Category> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error }: any = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Category not found");

    return {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      created_at: data.created_at || undefined,
      updated_at: data.updated_at || undefined,
    };
  },

  async getCategories(): Promise<Category[]> {
    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const { data, error }: any = await supabase.from("categories").select("*");
    if (error) {
      throw error;
    }
    if (!data) {
      return [];
    }

    const sortedCategories = data.sort(
      (a: any, b: any) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return sortedCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description || undefined,
      image_url: c.image_url || undefined,
      created_at: c.created_at || undefined,
      updated_at: c.updated_at || undefined,
    }));
  },

  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">
  ) {
    const { data, error }: any = await supabase
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
    const { data, error }: any = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return data;
  },
};

export default categoryService;
