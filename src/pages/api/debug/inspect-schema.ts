import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/integrations/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the actual table structure by trying to select all columns from an empty result
    const { data, error } = await supabase
      .from('partner_registrations')
      .select('*')
      .limit(0) // This will show us the column structure without returning data

    console.log('Table structure query result:', { data, error })

    // Also try to get a sample record to see actual column names
    const { data: sampleData, error: sampleError } = await supabase
      .from('partner_registrations')
      .select('*')
      .limit(1)

    console.log('Sample record:', { data: sampleData, error: sampleError })

    return res.status(200).json({
      tableStructure: {
        success: !error,
        error: error?.message || null,
        columns: data ? Object.keys(data[0] || {}) : []
      },
      sampleRecord: {
        success: !sampleError,
        error: sampleError?.message || null,
        data: sampleData,
        actualColumns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
      },
      message: 'Schema inspection completed'
    })

  } catch (error: any) {
    console.error('Error inspecting schema:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    })
  }
}
