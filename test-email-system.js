// Test script to verify email functionality
import { emailService } from '../src/services/emailService'

async function testEmailSystem() {
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

  try {
    console.log("Testing email system...")
    await emailService.sendBookingConfirmationEmails(testEmailData)
    console.log("✅ Email test completed successfully!")
  } catch (error) {
    console.error("❌ Email test failed:", error)
  }
}

testEmailSystem()
