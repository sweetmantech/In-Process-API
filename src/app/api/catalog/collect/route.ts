import { NextRequest } from 'next/server';
import validateCatalogCollect from '@/lib/catalog/validateCatalogCollect';
import collectCatalogMomentHandler from '@/lib/catalog/collectCatalogMomentHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCatalogCollect(req);
    if (validated instanceof Response) return validated;
    return await collectCatalogMomentHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to collect catalog moment' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
