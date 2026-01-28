import { NextRequest } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { tasks } from '@trigger.dev/sdk';
import { triggerMuxToArweaveSchema } from '@/lib/schema/triggerMuxToArweaveSchema';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress } = authResult;

    const body = await req.json();
    const validationResult = validate(triggerMuxToArweaveSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { collectionAddress, tokenIds, chainId } = validationResult.data;

    // Trigger the migration task
    const handle = await tasks.trigger('migrate-mux-to-arweave', {
      collectionAddress: collectionAddress as `0x${string}`,
      tokenIds,
      chainId,
      artistAddress: artistAddress as `0x${string}`,
    });

    return Response.json({
      success: true,
      runId: handle.id,
      message: `Migration task triggered successfully for ${tokenIds.length} token(s)`,
    });
  } catch (e: any) {
    console.error('Error triggering MUX to Arweave migration:', e);
    const message = e?.message ?? 'Failed to trigger MUX to Arweave migration';
    return Response.json({ message, success: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
