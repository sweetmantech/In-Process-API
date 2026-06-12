import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateCreateMuxUpload = async (req: NextRequest) => {
  const uploadKey = req.headers.get('x-upload-key');
  if (uploadKey === process.env.IN_PROCESS_UPLOAD_KEY) return;
  return authMiddleware(req);
};

export default validateCreateMuxUpload;
