import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/integrations/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase client not configured' })
  }

  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return res.status(500).json({ 
        error: 'Failed to list buckets', 
        details: bucketsError.message 
      })
    }

    // Check if registration-documents bucket exists
    const registrationBucket = buckets?.find(bucket => bucket.name === 'registration-documents')
    
    // Try to list files in the bucket (this will also test permissions)
    let bucketAccessible = false
    let bucketFiles = []
    
    if (registrationBucket) {
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from('registration-documents')
          .list('', { limit: 5 })
        
        if (!filesError) {
          bucketAccessible = true
          bucketFiles = files || []
        } else {
          console.error('Error accessing bucket:', filesError)
        }
      } catch (error) {
        console.error('Exception accessing bucket:', error)
      }
    }

    return res.status(200).json({
      buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })),
      registrationBucketExists: !!registrationBucket,
      registrationBucketAccessible: bucketAccessible,
      sampleFiles: bucketFiles.slice(0, 3),
      totalBuckets: buckets?.length || 0
    })

  } catch (error: any) {
    console.error('Error checking bucket:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
