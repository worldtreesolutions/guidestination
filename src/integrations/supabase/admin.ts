import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Create a Supabase client with admin privileges
// This should only be used for server-side operations that need elevated permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);

export default supabaseAdmin;