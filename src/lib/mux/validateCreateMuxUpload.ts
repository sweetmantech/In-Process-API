import { NextRequest, NextResponse } from 'next/server';

const validateCreateMuxUpload = (req: NextRequest) => {
  const uploadKey = req.headers.get('x-upload-key');
  if (uploadKey === process.env.IN_PROCESS_UPLOAD_KEY) return;
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
};

export default validateCreateMuxUpload;
