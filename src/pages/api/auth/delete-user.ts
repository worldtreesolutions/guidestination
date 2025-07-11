import { supabaseAdmin } from '@/integrations/supabase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required and must be a string.' });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Supabase admin user deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete user.' });
    }

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('API error in delete-user:', error);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
}
