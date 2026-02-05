import { NextRequest, NextResponse } from 'next/server';
import { validateImageProxy } from '@/lib/media/validateImageProxy';
import imageProxyHandler from '@/lib/media/imageProxyHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateImageProxy(req);

    if (validated instanceof NextResponse) {
      return validated;
    }

    return imageProxyHandler(validated);
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
