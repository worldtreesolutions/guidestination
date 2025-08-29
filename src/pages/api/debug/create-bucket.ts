import { NextApiRequest, NextApiResponse } from 'next'
import { getAdminClient } from '@/integrations/supabase/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseAdmin = getAdminClient()
    
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not configured' })
    }

    // Create the registration-documents bucket as private
    const { data, error } = await supabaseAdmin.storage.createBucket('registration-documents', {
      public: false,
      allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error('Error creating bucket:', error)
      return res.status(500).json({ 
        error: 'Failed to create bucket', 
        details: error.message 
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Private bucket "registration-documents" created successfully',
      bucketData: data
    })

  } catch (error: any) {
    console.error('Error creating bucket:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
