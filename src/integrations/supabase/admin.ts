
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Check if required environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

// Create admin client only if service role key is available
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseServiceRoleKey) {
  supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn("SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will be limited.");
}

// Export a safe admin client that handles missing service role key
export default supabaseAdmin;

// Helper function to check if admin client is available
export const isAdminAvailable = (): boolean => {
  return supabaseAdmin !== null;
};

// Safe admin client wrapper
export const getAdminClient = () => {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not available. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.");
  }
  return supabaseAdmin;
};
