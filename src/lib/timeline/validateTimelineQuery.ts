import { NextRequest, NextResponse } from 'next/server';
import timelineQuerySchema from '@/lib/schema/timelineQuerySchema';

const validateTimelineQuery = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const result = timelineQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!result.success) {
    return NextResponse.json(
      { status: 'error', message: result.error.issues[0].message },
      { status: 400 }
    );
  }
  return result.data;
};

export default validateTimelineQuery;
