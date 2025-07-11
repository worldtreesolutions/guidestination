import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface Activity {
  id: number;
  title: string;
  category_id?: number;
  [key: string]: any;
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

  async getCategoryById(id: string): Promise<{ data: Category | null; error: any | null }> {
    if (!supabase) {
      const err = { message: "Supabase client not initialized", details: "Check environment variables", hint: "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set", code: "CLIENT_ERROR" };
      console.error(err.message, err.details);
      return { data: null, error: err };
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = { message: "Invalid category ID format. ID must be a number.", details: `Received: ${id}`, hint: "Ensure ID is a numeric string.", code: "22P02" };
      console.error(err.message, err.details);
      return { data: null, error: err };
    }

    const result = await supabase
      .from("categories")
      .select("*")
      .eq("id", numericId)
      .single();

    if (result.error && result.error.code !== "PGRST116") { 
      console.error(`Error fetching category with ID ${numericId}:`, result.error.message);
      return { data: null, error: result.error };
    }
    
    const categoryData = result.data ? {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description || undefined,
      created_at: result.data.created_at || new Date().toISOString(),
      updated_at: result.data.updated_at || new Date().toISOString()
    } : null;
    
    return { data: categoryData, error: result.error?.code === "PGRST116" ? null : result.error };
  },

  async getActivitiesByCategoryId(categoryId: number): Promise<{ data: Activity[] | null; error: any | null }> {
    if (!supabase) {
      const err = { message: "Supabase client not initialized", details: "Check environment variables", hint: "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set", code: "CLIENT_ERROR" };
      console.error(err.message, err.details);
      return { data: null, error: err };
    }

    const result = await supabase
      .from("activities")
      .select("*")
      .eq("category_id", categoryId);

    if (result.error) {
      console.error(`Error fetching activities for category ID ${categoryId}:`, result.error.message);
      return { data: null, error: result.error };
    }
    
    const activities = (result.data || []).map((item: any) => ({
      ...item,
      category_id: item.category_id || categoryId
    }));
    
    return { data: activities, error: null };
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
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (error) throw error;

    return data || [];
  },

  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">
  ) {
    const { data, error } = await supabase
      .from("categories")
      .insert(category);

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
      .eq("id", id);

    if (error) throw error;

    return data;
  },
};

export default categoryService;
