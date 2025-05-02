import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Category = Database['public']['Tables']['categories']['Row'];

const categoryService = {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error("Error fetching categories:", error.message);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a category by ID
   */
  async getCategoryById(id: number): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === "PGRST116") { // Not found is not an error here
        return null;
      }
      console.error("Error fetching category by ID:", error.message);
      throw error;
    }

    return data;
  },

  /**
   * Get category name by ID
   */
  async getCategoryNameById(id: number): Promise<string> {
    const category = await this.getCategoryById(id);
    return category ? category.name : "Uncategorized";
  }
};

export default categoryService;