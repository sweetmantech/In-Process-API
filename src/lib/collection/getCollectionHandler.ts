import { NextResponse } from 'next/server';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';
import { fetchTokenMetadata } from '@/lib/protocolSdk/ipfs/token-metadata';

interface GetCollectionInput {
  collectionAddress: string;
  chainId: number;
}

const getCollectionHandler = async ({
  collectionAddress,
  chainId,
}: GetCollectionInput): Promise<NextResponse> => {
  const { data: collections, error } = await selectCollections({
    addresses: [collectionAddress],
    chainId,
  });
  const collection = collections?.[0] ?? null;

  console.log('collection', collection);
  if (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }

  if (!collection) {
    return NextResponse.json(
      { status: 'error', message: 'Collection not found' },
      { status: 404 }
    );
  }

  let metadata = null;
  try {
    metadata = await fetchTokenMetadata(collection.uri);
  } catch (error) {
    console.error(error);
  }

  const admins = await selectAdmins({
    moments: [{ collectionId: collection.id, token_id: 0 }],
  });

  const uniqueAdmins = Array.from(
    new Set(admins.map((admin) => admin.artist_address))
  ).sort((b, a) => b.localeCompare(a));

  return NextResponse.json({ ...collection, metadata, admins: uniqueAdmins });
};

export default getCollectionHandler;
