
// This file might be automatically generated. If so, this manual edit might be overwritten.
// It has been modified to use environment variables for Supabase URL and Anon Key.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("Supabase URL is missing from environment variables. Please set NEXT_PUBLIC_SUPABASE_URL.");
}
if (!supabaseAnonKey) {
  console.error("Supabase Anon Key is missing from environment variables. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

// Create a fallback client if environment variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase client not properly configured. Using mock client.");
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createSupabaseClient();
