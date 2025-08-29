import { NextApiRequest, NextApiResponse } from "next";
import { getAdminClient } from "@/integrations/supabase/admin";

type Data = {
  message?: string;
  error?: string;
  buckets?: any[];
  finalBuckets?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('Setting up storage buckets...');
    
    const supabaseAdmin = getAdminClient();
    
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not configured. Please ensure SUPABASE_SERVICE_ROLE_KEY is set.' });
    }
    
    // List existing buckets first
    const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return res.status(500).json({ error: 'Failed to list existing buckets.' });
    }

    console.log('Existing buckets:', existingBuckets);

    const bucketsToCreate = [
      {
        id: 'registration-documents',
        name: 'registration-documents',
        public: false, // Private bucket for sensitive documents
        file_size_limit: 15728640, // 15MB
        allowed_mime_types: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      },
      {
        id: 'media',
        name: 'media',
        public: true, // Public bucket for activity images/videos
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
      },
      {
        id: 'profiles',
        name: 'profiles',
        public: true, // Public bucket for profile pictures
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
      }
    ];

    const results = [];

    for (const bucket of bucketsToCreate) {
      // Check if bucket already exists
      const existingBucket = existingBuckets?.find(b => b.name === bucket.name);
      
      if (existingBucket) {
        console.log(`Bucket ${bucket.name} already exists`);
        results.push({ bucket: bucket.name, status: 'already_exists' });
        continue;
      }

      // Create bucket
      const { data, error } = await supabaseAdmin.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types
      });

      if (error) {
        console.error(`Error creating bucket ${bucket.name}:`, error);
        results.push({ bucket: bucket.name, status: 'error', error: error.message });
      } else {
        console.log(`Successfully created bucket ${bucket.name}`);
        results.push({ bucket: bucket.name, status: 'created', data });
      }
    }

    // List buckets again to confirm
    const { data: finalBuckets, error: finalListError } = await supabaseAdmin.storage.listBuckets();
    
    return res.status(200).json({ 
      message: 'Storage setup completed',
      buckets: results,
      finalBuckets: finalBuckets || []
    });

  } catch (error) {
    console.error('API error in setup-storage:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while setting up storage.' });
  }
}
