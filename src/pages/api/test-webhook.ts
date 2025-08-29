import { NextApiRequest, NextApiResponse } from 'next'
import { getAdminClient } from '@/integrations/supabase/admin'
import activityService from '@/services/activityService'
import emailService from '@/services/emailService'
import { stat } from 'fs'

// Test endpoint to simulate Stripe webhook events for local testing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }


  // Stripe CLI forwards events as { type, data: { object: { ... } } }
  const event = req.body;
  const eventType = event.type;
  const session = event.data?.object || {};

  // Only process checkout.session events
  if (session.object !== 'checkout.session') {
    console.log(`Ignoring event type: ${eventType}, object: ${session.object}`);
    return res.status(200).json({ success: false, message: `Ignored event type: ${eventType}` });
  }

  // Log the full session object for debugging
  console.log('🔍 Full session object:', JSON.stringify(session, null, 2));
  // Extract fields from metadata for custom values
  const sessionId = session.id;
  const metadata = session.metadata || {};
  const isCartCheckout = metadata.isCartCheckout === 'true';
  const customer_email = metadata.customerEmail;
  const customerName = metadata.customerName;
  const customerId = metadata.customerId;
  const customerPhone = metadata.customerPhone;

  if (isCartCheckout && metadata.cartItems) {
    // Cart checkout: create a booking for each activity
    let cartItems;
    try {
      cartItems = JSON.parse(metadata.cartItems);
      console.log('📦 Cart items from session metadata:', cartItems);
    } catch (err) {
      console.error('Failed to parse cartItems:', err);
      return res.status(400).json({ error: 'Invalid cartItems metadata' });
    }
    const bookings = [];
    const adminClient = getAdminClient();
    for (const item of cartItems) {
      const bookingData = {
        activity_id: item.activityId,
        customer_id: customerId,
        status: 'confirmed',
        total_amount: item.price * item.quantity,
        created_at: new Date().toISOString(),
        participants: item.quantity,
        customer_name: customerName,
        customer_email: customer_email,
        customer_phone: customerPhone,
        is_qr_booking: false
      };
      console.log('📝 bookingData to be sent to bookActivity (cart):', JSON.stringify(bookingData, null, 2));
      let activityOwnerEmail = '';
      let activityOwnerName = '';
      let activityOwnerStripeId = '';
      try {
        // Fetch activity owner info using provider_id
        const { data: ownerData, error: ownerError } = await adminClient
          .from('activity_owners')
          .select('email, business_name, stripe_account_id')
          .eq('provider_id', item.providerId)
          .single();
        if (ownerError) {
        console.error('❌ Error fetching activity owner:', ownerError);
      } else if (ownerData) {
          const owner = ownerData as any;
          activityOwnerEmail = owner.email || '';
          activityOwnerName = owner.business_name || '';
          activityOwnerStripeId = owner.stripe_account_id || '';
        }
      } catch (ownerFetchError) {
        console.error('❌ Exception fetching activity owner:', ownerFetchError);
      }
      try {
        const booking = await activityService.bookActivity(bookingData, false);
        bookings.push({ ...booking, activityOwnerEmail, activityOwnerName, activityOwnerStripeId });
      } catch (bookingError) {
        console.error('❌ Error creating cart booking:', bookingError);
        if (bookingError instanceof Error) {
          console.error('❌ bookingError.message:', bookingError.message);
        }
        // Continue to next item, but you may want to handle errors differently
      }
    }
    // Send confirmation emails for all bookings (only once per booking, not duplicated)
    for (let i = 0; i < bookings.length; i++) {
      const booking = bookings[i];
      const item = cartItems[i];
      const emailData = {
        bookingId: parseInt(booking.id) || Date.now(),
        customerName: customerName || 'Test Customer',
        customerEmail: customer_email || 't4397051@gmail.com',
        activityTitle: item.title || 'Activity',
        activityDescription: item.description || '',
        totalAmount: booking.total_amount,
        participants: booking.participants,
        bookingDate: booking.booking_date,
        activityOwnerEmail: booking.activityOwnerEmail || '',
        activityOwnerName: booking.activityOwnerName || '',
        activityOwnerStripeId: booking.activityOwnerStripeId || '',
        platformCommission: booking.total_amount * 0.2
      };
      // Only send confirmation email if booking was created successfully
      if (booking && booking.id) {
        console.log('📧 Sending confirmation emails for cart booking...');
        try {
          await emailService.sendBookingConfirmationEmails(emailData);
          console.log('✅ Confirmation emails sent successfully for cart booking');
        } catch (emailError) {
          console.error('❌ Error sending confirmation email for cart booking:', emailError);
        }
      } else {
        console.warn('⚠️ Skipping email for booking with missing ID:', booking);
      }
    }
    return res.status(200).json({
      success: true,
      message: 'Cart bookings processed successfully',
      bookings: bookings.map(b => ({
        id: b.id,
        activity_id: b.activity_id,
        customer_email: b.customer_email,
        customerName: b.customer_name,
        totalAmount: b.total_amount,
        participants: b.participants,
        activityOwnerEmail: b.activityOwnerEmail,
        activityOwnerName: b.activityOwnerName,
        activityOwnerStripeId: b.activityOwnerStripeId
      }))
    });
  }

  // Single booking checkout
  const activityId = metadata.activityId ? Number(metadata.activityId) : undefined;
  const participants = metadata.participants ? Number(metadata.participants) : undefined;
  const totalAmount = metadata.baseAmount ? Number(metadata.baseAmount) : undefined;
  const final_price = metadata.final_price ? Number(metadata.final_price) : undefined;
  const providerId = metadata.providerId;

  console.log('🧪 Test webhook triggered with (parsed):', {
    sessionId,
    customer_email,
    customerName,
    activityId,
    participants,
    totalAmount,
    customerId,
    final_price
  });

  try {
    const client = getAdminClient();
    if (!client) {
      throw new Error('Database connection failed');
    }

    // Fetch activity owner info using providerId
    let activityOwnerEmail = '';
    let activityOwnerName = '';
    let activityOwnerStripeId = '';
    try {
      const { data: ownerData, error: ownerError } = await client
        .from('activity_owners')
        .select('email, business_name, stripe_account_id')
        .eq('provider_id', providerId)
        .single();
      if (ownerError) {
        console.error('❌ Error fetching activity owner:', ownerError);
      } else if (ownerData) {
        const owner = ownerData as any;
        activityOwnerEmail = owner.email || '';
        activityOwnerName = owner.business_name || '';
        activityOwnerStripeId = owner.stripe_account_id || '';
      }
    } catch (ownerFetchError) {
      console.error('❌ Exception fetching activity owner:', ownerFetchError);
    }

    // Prepare booking data for activityService.bookActivity
    const bookingData = {
      activity_id: activityId ? Number(activityId) : undefined,
      customer_id: customerId,
      status: 'confirmed',
      total_amount: final_price ? Number(final_price) : (totalAmount ? Number(totalAmount) : undefined),
      created_at: new Date().toISOString(),
      participants: participants ? Number(participants) : undefined,
      customer_name: customerName,
      customer_email: customer_email,
      customer_phone: customerPhone,
      is_qr_booking: false // Not in type, but kept for reference
    };

    console.log('📝 bookingData to be sent to bookActivity:', JSON.stringify(bookingData, null, 2));

    // For test, assume requires_approval is false (status will not be set to pending)
    let booking;
    try {
      booking = await activityService.bookActivity(bookingData, false);
      console.log('✅ Test booking created:', booking);
    } catch (bookingError) {
      console.error('❌ Error creating test booking:', bookingError);
      if (bookingError instanceof Error) {
        console.error('❌ bookingError.message:', bookingError.message);
      }
      return res.status(500).json({ error: 'Failed to create test booking', details: bookingError });
    }

    // Send confirmation emails
    const emailData = {
      bookingId: parseInt(booking.id) || Date.now(),
      customerName: customerName || 'Test Customer',
      customerEmail: customer_email || 't4397051@gmail.com',
      activityTitle: 'Test Activity',
      activityDescription: 'Bangkok, Thailand',
      totalAmount: final_price ?? totalAmount ?? 100,
      participants: participants || 2,
      bookingDate: booking.booking_date,
      activityOwnerEmail: activityOwnerEmail,
      activityOwnerName: activityOwnerName,
      activityOwnerStripeId: activityOwnerStripeId,
      platformCommission: (final_price ?? totalAmount ?? 100) * 0.2
    };

    console.log('📧 Sending confirmation emails...');
    try {
      await emailService.sendBookingConfirmationEmails(emailData);
      console.log('✅ Confirmation emails sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Test webhook processed successfully',
      booking: {
        id: booking.id,
        sessionId,
        customer_email: emailData.customerEmail,
        customerName: emailData.customerName,
        totalAmount: emailData.totalAmount,
        participants: emailData.participants,
        activityOwnerEmail: emailData.activityOwnerEmail,
        activityOwnerName: emailData.activityOwnerName,
        activityOwnerStripeId: emailData.activityOwnerStripeId
      }
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error)
    return res.status(500).json({
      error: 'Test webhook failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
