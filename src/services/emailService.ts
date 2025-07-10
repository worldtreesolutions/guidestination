
import { getAdminClient } from "@/integrations/supabase/admin"

const supabase = getAdminClient()

export interface BookingConfirmationData {
  bookingId: number
  customerName: string
  customerEmail: string
  activityTitle: string
  activityDescription: string
  totalAmount: number
  participants: number
  bookingDate: string
  activityOwnerEmail: string
  activityOwnerName: string
  platformCommission: number
  partnerEmail?: string
  partnerName?: string
  partnerCommission?: number
  establishmentName?: string
}

export const emailService = {
  async sendBookingConfirmationEmails(data: BookingConfirmationData) {
    if (!supabase) {
      console.error("Supabase client not available for sending emails")
      return
    }

    try {
      // Send confirmation email to customer
      await this.sendCustomerConfirmationEmail(data)
      
      // Send notification email to activity owner
      await this.sendActivityOwnerNotificationEmail(data)
      
      // Send notification email to partner if applicable
      if (data.partnerEmail && data.partnerName) {
        await this.sendPartnerNotificationEmail(data)
      }
      
      console.log(`Booking confirmation emails sent for booking ${data.bookingId}`)
    } catch (error) {
      console.error("Error sending booking confirmation emails:", error)
      throw error
    }
  },

  async sendCustomerConfirmationEmail(data: BookingConfirmationData) {
    const emailContent = this.generateCustomerEmailContent(data)
    
    // Using Supabase Edge Functions for email sending
    // This will be configured when SMTP is set up
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.customerEmail,
        subject: `Booking Confirmation - ${data.activityTitle}`,
        html: emailContent,
        type: 'booking_confirmation_customer'
      }
    })

    if (error) {
      console.error("Error sending customer confirmation email:", error)
      throw error
    }
  },

  async sendActivityOwnerNotificationEmail(data: BookingConfirmationData) {
    const emailContent = this.generateActivityOwnerEmailContent(data)
    
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.activityOwnerEmail,
        subject: `New Booking Received - ${data.activityTitle}`,
        html: emailContent,
        type: 'booking_notification_owner'
      }
    })

    if (error) {
      console.error("Error sending activity owner notification email:", error)
      throw error
    }
  },

  async sendPartnerNotificationEmail(data: BookingConfirmationData) {
    if (!data.partnerEmail || !data.partnerName) return

    const emailContent = this.generatePartnerEmailContent(data)
    
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.partnerEmail,
        subject: `Commission Earned - New Booking via ${data.establishmentName}`,
        html: emailContent,
        type: 'booking_notification_partner'
      }
    })

    if (error) {
      console.error("Error sending partner notification email:", error)
      throw error
    }
  },

  generateCustomerEmailContent(data: BookingConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { color: #2563eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p>Thank you for booking with Guidestination</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            
            <p>Your booking has been confirmed! Here are your booking details:</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Activity:</strong> ${data.activityTitle}</p>
              <p><strong>Description:</strong> ${data.activityDescription}</p>
              <p><strong>Participants:</strong> ${data.participants}</p>
              <p><strong>Total Amount:</strong> <span class="highlight">฿${data.totalAmount.toFixed(2)}</span></p>
              <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            </div>
            
            <p>We're excited to have you join this experience! The activity provider will contact you soon with additional details.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>The Guidestination Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Guidestination. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  generateActivityOwnerEmailContent(data: BookingConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .commission-info { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { color: #059669; font-weight: bold; }
          .warning { color: #f59e0b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Received!</h1>
            <p>You have a new customer booking</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.activityOwnerName},</p>
            
            <p>Great news! You've received a new booking for your activity.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Activity:</strong> ${data.activityTitle}</p>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Participants:</strong> ${data.participants}</p>
              <p><strong>Total Amount:</strong> <span class="highlight">฿${data.totalAmount.toFixed(2)}</span></p>
              <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            </div>
            
            <div class="commission-info">
              <h3>Commission Information</h3>
              <p><strong>Platform Commission (20%):</strong> <span class="warning">฿${data.platformCommission.toFixed(2)}</span></p>
              <p><strong>Your Earnings:</strong> <span class="highlight">฿${(data.totalAmount - data.platformCommission).toFixed(2)}</span></p>
              <p><em>Note: The platform commission of ฿${data.platformCommission.toFixed(2)} is owed to Guidestination and will be invoiced separately.</em></p>
            </div>
            
            <p>Please contact your customer to arrange the activity details and confirm the meeting point.</p>
            
            <p>Best regards,<br>The Guidestination Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Guidestination. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  generatePartnerEmailContent(data: BookingConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Commission Earned</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .booking-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .commission-info { background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { color: #059669; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Commission Earned!</h1>
            <p>New booking through your establishment</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.partnerName},</p>
            
            <p>Congratulations! A new booking has been made through your establishment <strong>${data.establishmentName}</strong>.</p>
            
            <div class="booking-details">
              <h3>Booking Details</h3>
              <p><strong>Activity:</strong> ${data.activityTitle}</p>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Participants:</strong> ${data.participants}</p>
              <p><strong>Total Booking Amount:</strong> ฿${data.totalAmount.toFixed(2)}</p>
              <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            </div>
            
            <div class="commission-info">
              <h3>Your Commission</h3>
              <p><strong>Commission Earned:</strong> <span class="highlight">฿${data.partnerCommission?.toFixed(2) || '0.00'}</span></p>
              <p><em>This commission will be processed and paid according to your partnership agreement.</em></p>
            </div>
            
            <p>Thank you for being a valued partner with Guidestination!</p>
            
            <p>Best regards,<br>The Guidestination Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 Guidestination. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export default emailService
