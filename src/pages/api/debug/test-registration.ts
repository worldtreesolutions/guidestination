import { NextApiRequest, NextApiResponse } from 'next'
import partnerService from '@/services/partnerService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const testData = {
      business_name: "Test Business",
      owner_name: "Test Owner", 
      email: `testpartner${Date.now()}@gmail.com`,
      phone: "1234567890",
      address: "123 Test Street",
      latitude: 40.7128,
      longitude: -74.0060,
      place_id: "test_place_id",
      commission_package: "premium" as const,
      supporting_documents: [],
      status: "pending" as const
    }

    console.log('Testing partner registration with data:', testData)

    const result = await partnerService.createPartnerRegistration(testData)
    
    return res.status(200).json({
      success: true,
      message: 'Test registration successful',
      userId: result.user?.id,
      partnerData: result.partner
    })

  } catch (error: any) {
    console.error('Test registration error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Test registration failed'
    })
  }
}
