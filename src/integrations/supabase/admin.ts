
    import { createClient } from "@supabase/supabase-js";
    import { Database } from "./types";

    // Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side environment
    // Use supabaseClient for client-side operations
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    export default supabaseAdmin;
  