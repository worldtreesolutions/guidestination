
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
type Activity = Database["public"]["Tables"]["activities"]["Row"];

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
      throw error;
    }
    return data || [];
  },

  async getCategoryById(id: string): Promise<{ data: Category | null; error: any | null }> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = { message: "Invalid category ID format. ID must be a number.", details: `Received: ${id}`, hint: "Ensure ID is a numeric string.", code: "22P02" };
      console.error(err.message, err.details);
      return { data: null, error: err };
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error && error.code !== "PGRST116") { 
      console.error(`Error fetching category with ID ${numericId}:`, error.message);
      return { data: null, error };
    }
    return { data, error: error?.code === "PGRST116" ? null : error };
  },

  async getActivitiesByCategoryId(categoryId: number): Promise<{ data: Activity[] | null; error: any | null }> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("category_id", categoryId);

    if (error) {
      console.error(`Error fetching activities for category ID ${categoryId}:`, error.message);
      return { data: null, error };
    }
    return { data, error };
  },
};

export default categoryService;
