
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, entityId, message } = req.body;

    if (!type || !entityId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create notification
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        type,
        entity_id: entityId,
        message,
        read: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
