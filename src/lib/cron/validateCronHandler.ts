import { NextRequest, NextResponse } from 'next/server';

const validateCronHandler = (req: NextRequest): NextResponse | null => {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
};

export default validateCronHandler;
