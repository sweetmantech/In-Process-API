import { NextRequest } from 'next/server';

const getChannelFromReqHeader = (req: NextRequest): 'web' | 'api' => {
  const origin = req.headers.get('origin') ?? '';
  const isWeb =
    origin.includes('inprocess.world') ||
    origin.includes('stayinprocess.vercel.app');
  return isWeb ? 'web' : 'api';
};

export default getChannelFromReqHeader;
