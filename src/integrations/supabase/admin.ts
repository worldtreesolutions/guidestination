
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Function to get environment variables safely
const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    // Client-side: return undefined as service role key should not be exposed
    return undefined;
  }
  return process.env[key];
};

// Check if required environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Function to create admin client lazily
const createAdminClient = () => {
  if (!supabaseUrl) {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // Server-side in production - log warning but don't throw during build
      console.warn("NEXT_PUBLIC_SUPABASE_URL not set. Admin client will be unavailable.");
    }
    return null;
  }
  
  const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseServiceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will be limited.");
    return null;
  }
  
  try {
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error);
    return null;
  }
};

// Lazy initialization of admin client
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

// Helper function to check if admin client is available
export const isAdminAvailable = (): boolean => {
  if (supabaseAdmin === null) {
    supabaseAdmin = createAdminClient();
  }
  return supabaseAdmin !== null;
};

// Safe admin client wrapper with lazy initialization
export const getAdminClient = () => {
  if (supabaseAdmin === null) {
    supabaseAdmin = createAdminClient();
  }
  
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client not available. Please ensure SUPABASE_SERVICE_ROLE_KEY environment variable is set and the application is running on the server side.");
  }
  
  return supabaseAdmin;
};

// Export default admin client (may be null)
export default supabaseAdmin;

// Function to safely get admin client without throwing
export const getAdminClientSafe = () => {
  if (supabaseAdmin === null) {
    supabaseAdmin = createAdminClient();
  }
  return supabaseAdmin;
};
