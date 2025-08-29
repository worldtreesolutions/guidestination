import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/integrations/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test if we can access partner_registrations table
    console.log('Testing partner_registrations table access...')
    
    // Try to read from the table (should work if RLS allows it)
    const { data: readTest, error: readError } = await supabase
      .from('partner_registrations')
      .select('id')
      .limit(1)
    
    console.log('Read test result:', { data: readTest, error: readError })

    // Try a simple insert test (this is what's failing)
    const testData = {
      id: uuidv4(), // Use proper UUID for the id field
      business_name: 'Test Business',
      owner_name: 'Test Owner',
      email: `test${Date.now()}@gmail.com`,
      phone: '1234567890',
      address: '123 Test St',
      latitude: 40.7128,
      longitude: -74.0060,
      place_id: 'test_place',
      room_count: 0,
      commission_package: 'premium',
      supporting_documents: [],
      status: 'pending'
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('partner_registrations')
      .insert([testData as any]) // Type assertion to bypass incorrect TypeScript types
      .select()

    console.log('Insert test result:', { data: insertTest, error: insertError })

    return res.status(200).json({
      readTest: {
        success: !readError,
        error: readError?.message || null,
        count: readTest?.length || 0
      },
      insertTest: {
        success: !insertError,
        error: insertError?.message || null,
        data: insertTest || null
      },
      message: 'Table access test completed'
    })

  } catch (error: any) {
    console.error('Error testing partner_registrations:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
