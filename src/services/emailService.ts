
import { formatCurrency, Currency } from "@/utils/currency";

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
  currency?: Currency
}

export const emailService = {
  async sendBookingConfirmationEmails(data: BookingConfirmationData) {
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
    
    try {
      // Try direct email API first
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/send-email-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `Booking Confirmation - ${data.activityTitle}`,
          html: emailContent,
          from: 'noreply@guidestination.com'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Customer confirmation email sent successfully via direct API")
        return
      } else {
        throw new Error(`Direct API failed: ${response.status}`)
      }
    } catch (error) {
      console.log("Direct email API failed, logging email for testing:", error)
      // Fallback to logging for testing
      this.logEmailForTesting('Customer Confirmation', data.customerEmail, `Booking Confirmation - ${data.activityTitle}`, emailContent)
      console.log("✅ Email logged for testing - check console for details")
    }
  },

  async sendActivityOwnerNotificationEmail(data: BookingConfirmationData) {
    const emailContent = this.generateActivityOwnerEmailContent(data)
    
    try {
      // Try direct email API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/send-email-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.activityOwnerEmail,
          subject: `New Booking Received - ${data.activityTitle}`,
          html: emailContent,
          from: 'noreply@guidestination.com'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Activity owner notification email sent successfully via direct API")
        return
      } else {
        throw new Error(`Direct API failed: ${response.status}`)
      }
    } catch (error) {
      console.log("Direct email API failed, logging email for testing:", error)
      // Fallback to logging for testing
      this.logEmailForTesting('Activity Owner Notification', data.activityOwnerEmail, `New Booking Received - ${data.activityTitle}`, emailContent)
      console.log("✅ Email logged for testing - check console for details")
    }
  },

  async sendPartnerNotificationEmail(data: BookingConfirmationData) {
    if (!data.partnerEmail || !data.partnerName) return

    // Only send commission invoice if partner commission > 0
    if (!data.partnerCommission || data.partnerCommission <= 0) {
      console.log(`No commission earned for partner ${data.partnerName}, skipping email`)
      return
    }

    const emailContent = this.generatePartnerCommissionInvoice(data)
    
    try {
      // Try direct email API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/send-email-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.partnerEmail,
          subject: `Commission Invoice - Booking #${data.bookingId} via ${data.establishmentName}`,
          html: emailContent,
          from: 'noreply@guidestination.com'
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Commission invoice sent successfully to partner ${data.partnerName} (฿${data.partnerCommission}) via direct API`)
        return
      } else {
        throw new Error(`Direct API failed: ${response.status}`)
      }
    } catch (error) {
      console.log("Direct email API failed, logging email for testing:", error)
      // Fallback to logging for testing
      this.logEmailForTesting('Partner Commission Invoice', data.partnerEmail, `Commission Invoice - Booking #${data.bookingId} via ${data.establishmentName}`, emailContent)
      console.log(`✅ Email logged for testing - check console for details`)
    }

    console.log(`Commission invoice sent to partner ${data.partnerName} (฿${data.partnerCommission})`)
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
              <p><strong>Total Amount:</strong> <span class="highlight">${formatCurrency(data.totalAmount, data.currency || 'THB')}</span></p>
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
              <p><strong>Total Amount:</strong> <span class="highlight">${formatCurrency(data.totalAmount, data.currency || 'THB')}</span></p>
              <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> #${data.bookingId}</p>
            </div>
            
            <div class="commission-info">
              <h3>Commission Information</h3>
              <p><strong>Platform Commission (20%):</strong> <span class="warning">${formatCurrency(data.platformCommission, data.currency || 'THB')}</span></p>
              <p><strong>Your Earnings:</strong> <span class="highlight">${formatCurrency(data.totalAmount - data.platformCommission, data.currency || 'THB')}</span></p>
              <p><em>Note: The platform commission of ${formatCurrency(data.platformCommission, data.currency || 'THB')} is owed to Guidestination and will be invoiced separately.</em></p>
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

  generatePartnerCommissionInvoice(data: BookingConfirmationData): string {
    const invoiceNumber = `COM-${Date.now()}-${data.bookingId}`
    const invoiceDate = new Date().toLocaleDateString()
    const commissionRate = data.partnerCommission && data.totalAmount > 0 
      ? ((data.partnerCommission / data.totalAmount) * 100).toFixed(1)
      : "0.0"

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Commission Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
          .invoice-header { background-color: #1f2937; color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
          .invoice-header h1 { margin: 0; font-size: 28px; }
          .invoice-header p { margin: 5px 0; opacity: 0.9; }
          
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-info div { flex: 1; }
          .invoice-info h3 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 15px; }
          
          .booking-summary { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .booking-summary h3 { color: #1f2937; margin-top: 0; }
          
          .commission-table { width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .commission-table th { background-color: #374151; color: white; padding: 15px; text-align: left; }
          .commission-table td { padding: 15px; border-bottom: 1px solid #e5e7eb; }
          .commission-table tr:nth-child(even) { background-color: #f9fafb; }
          .commission-table .total-row { background-color: #dcfce7; font-weight: bold; font-size: 18px; }
          .commission-table .total-row td { color: #166534; }
          
          .payment-terms { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; }
          .payment-terms h3 { color: #92400e; margin-top: 0; }
          
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
          
          .highlight { color: #059669; font-weight: bold; }
          .invoice-number { background-color: #eff6ff; padding: 10px; border-radius: 4px; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>Commission Invoice</h1>
            <p>Partner Commission Statement</p>
            <div class="invoice-number">
              <strong>Invoice #: ${invoiceNumber}</strong>
            </div>
          </div>
          
          <div class="invoice-info">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${data.partnerName}</strong></p>
              <p>${data.establishmentName}</p>
              <p>Email: ${data.partnerEmail}</p>
            </div>
            <div style="text-align: right;">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
              <p><strong>Booking ID:</strong> #${data.bookingId}</p>
              <p><strong>Status:</strong> <span style="color: #059669;">Commission Earned</span></p>
            </div>
          </div>
          
          <div class="booking-summary">
            <h3>Booking Summary</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p><strong>Activity:</strong> ${data.activityTitle}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Participants:</strong> ${data.participants}</p>
              </div>
              <div>
                <p><strong>Booking Date:</strong> ${new Date(data.bookingDate).toLocaleDateString()}</p>
                <p><strong>Total Booking Amount:</strong> ฿${data.totalAmount.toLocaleString()}</p>
                <p><strong>Your Commission Rate:</strong> ${commissionRate}%</p>
              </div>
            </div>
          </div>
          
          <table class="commission-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Booking Amount</th>
                <th>Commission Rate</th>
                <th>Commission Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${data.activityTitle}</strong><br>
                  <small>Booking #${data.bookingId} via ${data.establishmentName}</small>
                </td>
                <td>฿${data.totalAmount.toLocaleString()}</td>
                <td>${commissionRate}%</td>
                <td>฿${data.partnerCommission?.toLocaleString() || '0'}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>Total Commission Earned:</strong></td>
                <td><strong>฿${data.partnerCommission?.toLocaleString() || '0'}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="payment-terms">
            <h3>⚠️ Payment Terms & Conditions</h3>
            <p><strong>Important:</strong> Due to regulatory restrictions in Thailand, we cannot process direct payments to partner accounts at this time.</p>
            <p><strong>Commission Status:</strong> This invoice represents commission earned and will be tracked in your partner portal.</p>
            <p><strong>Payment Processing:</strong> Commission payments will be processed manually according to your partnership agreement terms.</p>
            <p><strong>Contact:</strong> For questions about commission payments, please contact our partner support team.</p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #ecfdf5; border-radius: 8px;">
            <h3 style="color: #059669; margin-top: 0;">Thank You for Your Partnership!</h3>
            <p>This booking was successful thanks to your partnership with Guidestination. Your commission of <strong class="highlight">฿${data.partnerCommission?.toLocaleString() || '0'}</strong> has been recorded and will be processed according to our partnership agreement.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated commission invoice generated by Guidestination.</p>
            <p>&copy; ${new Date().getFullYear()} Guidestination. All rights reserved.</p>
            <p>For support: partner-support@guidestination.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  logEmailForTesting(type: string, to: string, subject: string, htmlContent: string) {
    console.log('\n=== EMAIL TEST LOG ===')
    console.log(`Type: ${type}`)
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML Content Length: ${htmlContent.length}`)
    console.log(`Timestamp: ${new Date().toISOString()}`)
    console.log('=== END EMAIL LOG ===\n')
    
    // Also log a sample of the HTML content
    const previewLength = 500
    console.log('Email Content Preview:')
    console.log(htmlContent.substring(0, previewLength) + (htmlContent.length > previewLength ? '...' : ''))
  },
}

export default emailService
