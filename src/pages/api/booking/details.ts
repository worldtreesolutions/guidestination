import { NextApiRequest, NextApiResponse } from 'next'
import stripeService from '@/services/stripeService'
import { getAdminClient } from '@/integrations/supabase/admin'
import emailService from '@/services/emailService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { sessionId, type } = req.query

  console.log('API received query params:', req.query);
  console.log('sessionId:', sessionId);
  console.log('type:', type);

  if (!sessionId || typeof sessionId !== 'string') {
    console.error('Missing or invalid sessionId in request');
    return res.status(400).json({ 
      error: 'Session ID is required',
      details: 'sessionId query parameter must be provided as a string',
      received: { sessionId, type }
    })
  }

  try {
    const client = getAdminClient()
    if (!client) {
      throw new Error('Database connection failed')
    }

    // Retrieve the Stripe session
    const session = await stripeService.retrieveSession(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    // Check if this is a cart checkout
    const isCartCheckout = session.metadata?.isCartCheckout === 'true'

    if (isCartCheckout) {
      // Handle cart checkout - retrieve multiple bookings
      const cartItems = Array.isArray(session.metadata?.items)
        ? session.metadata.items
        : (session.metadata?.items ? JSON.parse(session.metadata.items) : []);

      console.log('📦 Cart items from session metadata:', cartItems);

      let bookings: any[] = [];

      // Query bookings for this customer in the last hour
      // Cast client to any to avoid very deep TS instantiation from supabase client chain
      const cartBookingsQuery = await (client as any)
        .from('bookings')
        .select('id, activity_id, participants, total_amount, final_price, status, booking_date, customer_name, customer_email')
        .eq('customer_email', session.customer_details?.email ?? '')
        .gte('booking_date', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Within last hour
        .order('booking_date', { ascending: false }) as any;
      const cartDbBookings = cartBookingsQuery.data as any[] | undefined;
      const cartDbBookingsError = cartBookingsQuery.error;

      if (!cartDbBookingsError && Array.isArray(cartDbBookings) && cartDbBookings.length > 0) {
        console.log('✅ Found real bookings:', cartDbBookings.length);
        bookings = cartDbBookings;
        // Fetch activity details separately to avoid deep query issues
        const activityIds = bookings.map(b => b.activity_id);
        // Join activities with activity_owners to get provider email
        const { data: activities } = await client
          .from('activities')
          .select('id, title, meeting_point, duration, image_url, pickup_location, provider_id, activity_owners(email)')
          .in('id', activityIds);
        // Map activities to bookings
        bookings = bookings.map(booking => {
          let activity = null;
          let providerEmail = null;
          if (Array.isArray(activities)) {
            const found = activities.find((a: any) => a.id === booking.activity_id);
            activity = found || null;
            // If activity_owners is an array, get the first email
            if (found && found.activity_owners && Array.isArray(found.activity_owners) && found.activity_owners.length > 0) {
              providerEmail = found.activity_owners[0].email;
            } else if (found && found.activity_owners && found.activity_owners.email) {
              providerEmail = found.activity_owners.email;
            }
          }
          return {
            ...booking,
            activity,
            providerEmail,
            amount: booking.final_price ?? booking.total_amount
          };
        });
      } else if (Array.isArray(cartItems) && cartItems.length > 0) {
        // No fallback bookings should be created; only use actual bookings from the database
        // If no real bookings are found, treat as no bookings
        console.log('⚠️ No real bookings found, not creating fallback bookings.');
        bookings = [];
      } else {
        // No bookings or cart items found
        console.log('⚠️ No cart items or bookings found for this session.');
        return res.status(404).json({
          error: 'No bookings found',
          message: 'No bookings or cart items could be found for this session. Please contact support if you believe this is an error.'
        });
      }

      // Process emails asynchronously for cart checkout
      // Duplicate email sending removed. Emails are now sent only from the webhook handler.

      return res.status(200).json({
        sessionId,
        type: 'cart',
        isCartCheckout: true,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        paymentStatus: session.payment_status,
        bookings: bookings.map(booking => ({
          id: `GD${booking.id}`,
          activity: booking.activity,
          participants: booking.participants,
          amount: booking.amount ?? booking.final_price ?? booking.total_amount,
          status: booking.status
        }))
      })

    } else {
      // Handle single booking
      const activityId = session.metadata?.activityId
      const bookingId = session.metadata?.bookingId

      let booking = null
      if (bookingId) {
        // Query by booking ID if available
        const { data: dbBooking, error } = await client
          .from('bookings')
          .select('id, activity_id, participants, total_amount, status, booking_date, customer_name')
          .eq('id', bookingId)
          .single()

        if (!error && dbBooking) {
          // Fetch activity details separately
          const { data: activity } = await client
            .from('activities')
            .select('id, title, meeting_point, duration, image_url, pickup_location, provider_id, activity_owners(email)')
            .eq('id', dbBooking.activity_id)
            .single()
          let providerEmail = null;
          if (activity && activity.activity_owners && Array.isArray(activity.activity_owners) && activity.activity_owners.length > 0) {
            providerEmail = activity.activity_owners[0].email;
          } else if (activity && activity.activity_owners && activity.activity_owners.email) {
            providerEmail = activity.activity_owners.email;
          }
          booking = {
            ...dbBooking,
            activities: activity,
            providerEmail
          }
        }
      } else if (activityId) {
        // Fallback: query by session and activity details
        const { data: dbBooking, error } = await client
          .from('bookings')
          .select('id, activity_id, participants, total_amount, status, booking_date, customer_name')
          .eq('activity_id', parseInt(activityId))
          .eq('total_amount', session.amount_total ? session.amount_total / 100 : 0)
          .order('booking_date', { ascending: false })
          .limit(1)
          .single()

        if (!error && dbBooking) {
          // Fetch activity details separately
          const { data: activity } = await client
            .from('activities')
            .select('id, title, meeting_point, duration, image_url, pickup_location, provider_id, activity_owners(email)')
            .eq('id', dbBooking.activity_id)
            .single()
          let providerEmail = null;
          if (activity && activity.activity_owners && Array.isArray(activity.activity_owners) && activity.activity_owners.length > 0) {
            providerEmail = activity.activity_owners[0].email;
          } else if (activity && activity.activity_owners && activity.activity_owners.email) {
            providerEmail = activity.activity_owners.email;
          }
          booking = {
            ...dbBooking,
            activities: activity,
            providerEmail
          }
        }
      } else if (activityId) {
        // Fallback: if no booking found, fetch activity details directly for the given activityId
        const { data: activity } = await client
          .from('activities')
          .select('id, title, meeting_point, duration, image_url, pickup_location, provider_id, activity_owners(email)')
          .eq('id', parseInt(activityId))
          .single();
        let providerEmail = null;
        if (activity && activity.activity_owners && Array.isArray(activity.activity_owners) && activity.activity_owners.length > 0) {
          providerEmail = activity.activity_owners[0].email;
        } else if (activity && activity.activity_owners && activity.activity_owners.email) {
          providerEmail = activity.activity_owners.email;
        }
        booking = {
          id: `temp-${sessionId}-single`,
          activity_id: parseInt(activityId),
          participants: 1,
          total_amount: 0,
          final_price: 0,
          amount: 0,
          status: 'processing',
          booking_date: new Date().toISOString(),
          customer_name: session.customer_details?.name || 'Customer',
          activities: activity,
          providerEmail
        };
      }

      // Process email asynchronously
      if (booking && session.customer_details?.email) {
        console.log('🔵 Processing single booking email for:', session.customer_details.email);
        setImmediate(async () => {
          try {
            const emailBookingId = `GD${booking.id}`;
            // Debug log: who will receive the email
            console.log(`📧 Sending booking confirmation email for booking: ${emailBookingId}`);
            console.log(`   - To customer: ${session.customer_details!.email}`);
            const providerEmail = booking.activities?.provider_email;
            if (providerEmail) {
              console.log(`   - To activity provider: ${providerEmail}`);
            } else if (booking.providerEmail) {
              console.log(`   - To activity provider (from booking): ${booking.providerEmail}`);
            } else {
              console.log('   - No provider email found for this booking.');
            }
            const partnerEmail = session.metadata?.partnerReferralEmail || booking.partnerReferralEmail;
            if (partnerEmail) {
              console.log(`   - To partner (referral): ${partnerEmail}`);
            } else {
              console.log('   - No partner referral email for this booking.');
            }
            // Send to customer
            await emailService.sendBookingConfirmationEmails({
              ...booking,
              bookingId: emailBookingId,
              customerName: session.customer_details!.name || booking.customer_name || 'Customer',
              customerEmail: session.customer_details!.email!,
              activityTitle: booking.activities?.title || 'Activity',
              activityDescription: booking.activities?.meeting_point || 'Location',
              totalAmount: booking.final_price ?? booking.total_amount,
              platformCommission: (booking.final_price ?? booking.total_amount) * 0.2,
              participants: booking.participants,
              bookingDate: booking.booking_date,
              activityOwnerEmail: providerEmail,
              activityOwnerName: booking.activities?.title || 'Activity Owner'
            });
            // Send to activity provider if email exists
            if (providerEmail) {
              await emailService.sendBookingConfirmationEmails({
                ...booking,
                bookingId: emailBookingId,
                customerName: session.customer_details!.name || booking.customer_name || 'Customer',
                customerEmail: providerEmail,
                activityTitle: booking.activities?.title || 'Activity',
                activityDescription: booking.activities?.meeting_point || 'Location',
                totalAmount: booking.final_price ?? booking.total_amount,
                platformCommission: (booking.final_price ?? booking.total_amount) * 0.2,
                participants: booking.participants,
                bookingDate: booking.booking_date,
                activityOwnerEmail: providerEmail,
                activityOwnerName: booking.activities?.title || 'Activity Owner'
              });
            }
            // Send to partner if referral email exists
            if (partnerEmail) {
              await emailService.sendBookingConfirmationEmails({
                ...booking,
                bookingId: emailBookingId,
                customerName: session.customer_details!.name || booking.customer_name || 'Customer',
                customerEmail: partnerEmail,
                activityTitle: booking.activities?.title || 'Activity',
                activityDescription: booking.activities?.meeting_point || 'Location',
                totalAmount: booking.final_price ?? booking.total_amount,
                platformCommission: (booking.final_price ?? booking.total_amount) * 0.2,
                participants: booking.participants,
                bookingDate: booking.booking_date,
                activityOwnerEmail: providerEmail,
                activityOwnerName: booking.activities?.title || 'Activity Owner'
              });
            }
            console.log('✅ Email sent for single booking:', emailBookingId);
          } catch (emailError) {
            console.error('❌ Failed to send booking confirmation email:', emailError)
          }
        })
      } else {
        console.log('⚠️ No email sent for single booking - missing data:', {
          hasBooking: !!booking,
          email: session.customer_details?.email
        });
      }

      return res.status(200).json({
        sessionId,
        type: 'single',
        isCartCheckout: false,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        paymentStatus: session.payment_status,
        booking: booking ? {
          id: booking.id,
          activity: booking.activities,
          participants: booking.participants,
          amount: booking.final_price ?? booking.total_amount,
          status: booking.status,
          bookingDate: booking.booking_date
        } : null
      })
    }

  } catch (error) {
    console.error('Error retrieving booking details:', error)
    
    // Graceful error message if database query fails or no data
    return res.status(500).json({ 
      error: 'Failed to retrieve booking details',
      message: 'We could not retrieve your booking details at this time. Please try again later or contact support.',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
