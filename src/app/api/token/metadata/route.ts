import getOwner from '@/lib/zora/getOwner';
import { Address } from 'viem';
import { NextRequest } from 'next/server';
import getTokenURI from '@/lib/zora/getTokenURI';
import { getFetchableUrl } from '@/lib/protocolSdk/ipfs/gateway';
import { isArweaveURL } from '@/lib/protocolSdk/ipfs/arweave';
import readFromArweave from '@/lib/arweave/readFromArweave';

export async function GET(req: NextRequest) {
  try {
    const collection = req.nextUrl.searchParams.get('collection');
    const tokenId = req.nextUrl.searchParams.get('tokenId');

    const owner = await getOwner(collection as Address);
    const uri = await getTokenURI(
      collection as Address,
      parseInt(tokenId as string, 10)
    );
    let response: Response;
    if (isArweaveURL(uri)) {
      response = await readFromArweave(uri);
    } else {
      const fetchableUrl = await getFetchableUrl(uri);
      if (!fetchableUrl) {
        return Response.json(
          { message: 'Invalid or unsupported URI' },
          { status: 400 }
        );
      }
      response = await fetch(fetchableUrl);
    }
    const metadata = await response.json();

    return Response.json({
      owner,
      metadata,
    });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get metadata';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
