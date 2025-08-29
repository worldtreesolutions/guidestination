import { NextApiRequest, NextApiResponse } from 'next'
import { emailService } from '../../../services/emailService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const testEmailData = {
      bookingId: 999,
      customerName: "Test Customer",
      customerEmail: "test.customer@example.com",
      activityTitle: "Test Activity - Email Verification",
      activityDescription: "This is a test booking to verify email functionality",
      totalAmount: 100,
      participants: 2,
      bookingDate: new Date().toISOString(),
      activityOwnerEmail: "owner@example.com",
      activityOwnerName: "Test Activity Owner",
      platformCommission: 10,
      partnerEmail: "partner@example.com",
      partnerName: "Test Partner",
      partnerCommission: 5,
      establishmentName: "Test Establishment"
    }

    console.log("Testing email system via API...")
    await emailService.sendBookingConfirmationEmails(testEmailData)
    
    res.status(200).json({ 
      success: true, 
      message: "Email test completed",
      testData: testEmailData
    })
  } catch (error) {
    console.error("Email test failed:", error)
    res.status(500).json({ 
      error: 'Email test failed', 
      details: error.message 
    })
  }
}
