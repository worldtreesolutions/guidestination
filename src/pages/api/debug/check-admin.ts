import { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient, isAdminAvailable } from "@/integrations/supabase/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const adminAvailable = isAdminAvailable();
    console.log('Admin available:', adminAvailable);
    
    if (adminAvailable) {
      const admin = getAdminClient();
      console.log('Admin client:', !!admin);
      
      // Test a simple operation
      const { data, error } = await admin.storage.listBuckets();
      console.log('Buckets data:', data);
      console.log('Buckets error:', error);
      
      return res.status(200).json({
        adminAvailable,
        hasAdminClient: !!admin,
        bucketsCount: data?.length || 0,
        error: error?.message || null,
        serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        publicUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      });
    } else {
      return res.status(500).json({
        adminAvailable: false,
        error: 'Admin client not available',
        serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        publicUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      });
    }
  } catch (error: any) {
    console.error('Check admin error:', error);
    return res.status(500).json({
      error: error.message,
      serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      publicUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  }
}
