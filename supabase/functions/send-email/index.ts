
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  type: 'booking_confirmation_customer' | 'booking_notification_owner' | 'booking_notification_partner'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, type }: EmailRequest = await req.json()

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = Deno.env.get('SMTP_PORT')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPassword = Deno.env.get('SMTP_PASSWORD')
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@guidestination.com'
    const fromName = Deno.env.get('FROM_NAME') || 'Guidestination'

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      console.error('SMTP configuration missing')
      return new Response(
        JSON.stringify({ error: 'SMTP configuration not set up' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create SMTP connection and send email
    // Note: You'll need to implement the actual SMTP sending logic here
    // This is a template that shows the structure
    
    const emailData = {
      from: `${fromName} <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
      type: type
    }

    // Log the email attempt
    console.log(`Attempting to send ${type} email to ${to}`)

    // Here you would implement the actual SMTP sending
    // For now, we'll simulate success
    const emailSent = await sendEmailViaSMTP(emailData, {
      host: smtpHost,
      port: parseInt(smtpPort),
      user: smtpUser,
      password: smtpPassword
    })

    if (emailSent) {
      console.log(`Email sent successfully to ${to}`)
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error('Failed to send email')
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// SMTP sending function - implement based on your SMTP provider
async function sendEmailViaSMTP(emailData: any, smtpConfig: any): Promise<boolean> {
  try {
    // This is where you would implement the actual SMTP sending logic
    // You can use libraries like nodemailer equivalent for Deno
    // or make HTTP requests to email service APIs like SendGrid, Mailgun, etc.
    
    // For demonstration, we'll simulate a successful send
    // Replace this with actual SMTP implementation
    console.log('SMTP Config:', { 
      host: smtpConfig.host, 
      port: smtpConfig.port, 
      user: smtpConfig.user 
    })
    console.log('Email Data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      type: emailData.type
    })
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  } catch (error) {
    console.error('SMTP sending error:', error)
    return false
  }
}
