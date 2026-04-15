import { NextRequest, NextResponse } from 'next/server';
import { putNotificationsQuerySchema } from '@/lib/schema/notificationsSchema';

const validatePutNotificationsQuery = (req: NextRequest) => {
  const result = putNotificationsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return NextResponse.json(
      { message: 'Invalid input', errors },
      { status: 400 }
    );
  }
  return result.data;
};

export default validatePutNotificationsQuery;
