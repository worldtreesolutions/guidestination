import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not_set',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    environment: process.env.NODE_ENV || 'unknown'
  })
}
