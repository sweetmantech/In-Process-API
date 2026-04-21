import { NextRequest, NextResponse } from 'next/server';

const validateCronHandler = (req: NextRequest): NextResponse | null => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return null;
};

export default validateCronHandler;
