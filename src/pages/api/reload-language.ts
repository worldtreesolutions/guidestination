
import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // This is a simple API endpoint that can be used to force a client-side reload
  // It doesn't actually do anything on the server, but can be used as a ping endpoint
  // to ensure the client has the latest language settings
  res.status(200).json({ 
    success: true, 
    message: 'Language reload request received' 
  });
}
