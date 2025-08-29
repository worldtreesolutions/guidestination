import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/integrations/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing bucket access...')
    
    // Test 1: List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Buckets:', buckets)
    console.log('Buckets error:', bucketsError)

    // Test 2: Try to access registration-documents bucket
    let registrationBucketStatus = 'not_found'
    let registrationBucketError = null
    
    if (buckets?.find(b => b.name === 'registration-documents')) {
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from('registration-documents')
          .list('', { limit: 1 })
        
        if (filesError) {
          registrationBucketStatus = 'access_denied'
          registrationBucketError = filesError.message
        } else {
          registrationBucketStatus = 'accessible'
        }
      } catch (error: any) {
        registrationBucketStatus = 'error'
        registrationBucketError = error.message
      }
    }

    // Test 3: Try to access media bucket
    let mediaBucketStatus = 'not_found'
    let mediaBucketError = null
    
    if (buckets?.find(b => b.name === 'media')) {
      try {
        const { data: files, error: filesError } = await supabase.storage
          .from('media')
          .list('', { limit: 1 })
        
        if (filesError) {
          mediaBucketStatus = 'access_denied'
          mediaBucketError = filesError.message
        } else {
          mediaBucketStatus = 'accessible'
        }
      } catch (error: any) {
        mediaBucketStatus = 'error'
        mediaBucketError = error.message
      }
    }

    return res.status(200).json({
      totalBuckets: buckets?.length || 0,
      buckets: buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })),
      registrationDocuments: {
        exists: !!buckets?.find(b => b.name === 'registration-documents'),
        status: registrationBucketStatus,
        error: registrationBucketError
      },
      media: {
        exists: !!buckets?.find(b => b.name === 'media'),
        status: mediaBucketStatus,
        error: mediaBucketError
      },
      profiles: {
        exists: !!buckets?.find(b => b.name === 'profiles'),
        status: 'not_tested'
      }
    })

  } catch (error: any) {
    console.error('Error testing buckets:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
