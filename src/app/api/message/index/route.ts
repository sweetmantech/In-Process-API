import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import selectMessage from '@/lib/supabase/in_process_messages/selectMessage';
import { indexMessageMomentSchema } from '@/lib/schema/indexMessageMomentSchema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = validate(indexMessageMomentSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const data = validationResult.data;
    const message = await selectMessage(data.messageId);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
