import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

interface EmailRequest {
  to: string
  subject: string
  html: string
  from?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { to, subject, html, from = 'noreply@guidestination.com' }: EmailRequest = req.body

    // Configure nodemailer with your SMTP settings
    // You'll need to add these to your .env.local file
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const mailOptions = {
      from,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', result.messageId)
    res.status(200).json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully' 
    })

  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
