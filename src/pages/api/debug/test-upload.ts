import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/integrations/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Create a simple test file
    const testContent = "This is a test file for bucket verification"
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const fileName = `test-${Date.now()}.txt`

    console.log('Testing upload to registration-documents bucket...')

    // Try uploading to registration-documents bucket
    const { data, error } = await supabase.storage
      .from('registration-documents')
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return res.status(400).json({
        success: false,
        error: error.message,
        bucket: 'registration-documents',
        suggestion: error.message.includes('does not exist') 
          ? 'Bucket does not exist - please create it in Supabase dashboard'
          : error.message.includes('policy') 
          ? 'Check bucket permissions and RLS policies'
          : 'Check bucket configuration'
      })
    }

    console.log('Upload successful:', data)

    // Clean up - delete the test file
    const { error: deleteError } = await supabase.storage
      .from('registration-documents')
      .remove([fileName])

    return res.status(200).json({
      success: true,
      message: 'Upload test successful!',
      bucket: 'registration-documents',
      uploadPath: data.path,
      cleanedUp: !deleteError
    })

  } catch (error: any) {
    console.error('Test upload error:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      bucket: 'registration-documents'
    })
  }
}
