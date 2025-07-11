import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
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
    
    const categoryData = result.data ? {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description || undefined,
      image_url: result.data.image_url || undefined,
      created_at: result.data.created_at || undefined,
      updated_at: result.data.updated_at || undefined,
    } : null;
    
    return categoryData as Category | null;
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

    return sortedCategories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image_url: c.image_url,
    }));
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
