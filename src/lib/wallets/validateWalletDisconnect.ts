import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateWalletDisconnect = async (req: NextRequest) => {
  const validated = await authMiddleware(req);
  if (validated instanceof Response) return validated as NextResponse;
  const { primaryWallet: address } = validated;

  return { address };
};

export default validateWalletDisconnect;
