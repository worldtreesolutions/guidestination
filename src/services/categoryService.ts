
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type Activity = Database["public"]["Tables"]["activities"]["Row"];

export const categoryService = {
  async getAllCategories(): Promise<{  Category[] | null; error: any }> {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
    }
    return { data, error };
  },

  async getCategoryById(id: string): Promise<{  Category | null; error: any }> {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = { message: "Invalid category ID format. ID must be a number.", details: `Received: ${id}`, hint: "Ensure ID is a numeric string.", code: "22P02" };
      console.error(err.message, err.details);
      return {  null, error: err };
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", numericId) // Use parsed numericId
      .single();

    // PGRST116: Supabase error code for "Row to be returned was not found"
    // We can treat "not found" as a valid case (null data) rather than an application error.
    if (error && error.code !== "PGRST116") { 
      console.error(`Error fetching category with ID ${numericId}:`, error.message);
      return {  null, error };
    }
    // If error is PGRST116, data will be null, and we can consider error as null for the client.
    return { data, error: error?.code === "PGRST116" ? null : error };
  },

  async getActivitiesByCategoryId(categoryId: string): Promise<{  Activity[] | null; error: any }> {
    const numericCategoryId = parseInt(categoryId, 10);
    if (isNaN(numericCategoryId)) {
      const err = { message: "Invalid category ID format. ID must be a number.", details: `Received: ${categoryId}`, hint: "Ensure ID is a numeric string.", code: "22P02" };
      console.error(err.message, err.details);
      return {  null, error: err };
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("category_id", numericCategoryId); // Use parsed numericCategoryId

    if (error) {
      console.error(`Error fetching activities for category ID ${numericCategoryId}:`, error.message);
    }
    return { data, error };
  },

  // You can add other category-related service functions here as needed, for example:
  // async createCategory(name: string, description?: string): Promise<{  Category | null; error: any }> { ... }
  // async updateCategory(id: string, updates: Partial<Category>): Promise<{  Category | null; error: any }> { ... }
  // async deleteCategory(id: string): Promise<{  null; error: any }> { ... }
  // Remember to parse string IDs to numbers for any of these operations.
};

export default categoryService;
