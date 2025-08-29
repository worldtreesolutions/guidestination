
// This file might be automatically generated. If so, this manual edit might be overwritten.
// It has been modified to use environment variables for Supabase URL and Anon Key.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
const createSupabaseClient = () => {
  // During build time, allow missing env vars but warn
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // Server-side in production - log warnings but don't throw
      console.warn("Supabase environment variables not set. Client will be null.");
      console.warn("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
      return null;
    } else if (typeof window !== 'undefined') {
      // Client-side - throw meaningful error
      const missing = [];
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      throw new Error(`Supabase configuration missing: ${missing.join(', ')}`);
    }
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createSupabaseClient();
