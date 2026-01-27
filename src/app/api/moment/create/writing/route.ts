import { NextRequest } from 'next/server';
import { createMoment } from '@/lib/moment/createMoment';
import { createWritingMomentSchema } from '@/lib/schema/createMomentSchema';
import { convertWritingToContractSchema } from '@/lib/coinbase/convertWritingToContractSchema';
import { uploadWritingWithJson } from '@/lib/writing/uploadWritingWithJson';
import getCorsHeader from '@/lib/getCorsHeader';
import { validate } from '@/lib/schema/validate';

// CORS headers for allowing cross-origin requests
const corsHeaders = getCorsHeader();

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = validate(createWritingMomentSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }
    const data = validationResult.data;
    // Use title as the name for the metadata
    // If creating on existing collection (contract.address), use title; otherwise use contract.name (which is required for new collections)
    const collectionName = data.contract.address
      ? data.title
      : (data.contract.name ?? data.title);
    const metadataUri = await uploadWritingWithJson(
      collectionName,
      data.token.tokenContent
    );
    const convertedData = convertWritingToContractSchema(data, metadataUri);
    const result = await createMoment(convertedData);
    return Response.json(result, { headers: corsHeaders });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create writing moment';
    return Response.json({ message }, { status: 500, headers: corsHeaders });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
