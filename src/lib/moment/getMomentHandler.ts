import { NextResponse } from 'next/server';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';
import getMetadata from '@/lib/moment/getMetadata';
import getMomentAdmins from '@/lib/moment/getMomentAdmins';
import { resolveMomentInfo } from '@/lib/moment/resolveMomentInfo';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import { Moment } from '@/types/moment';

const getMomentHandler = async (moment: Moment) => {
  const { data: collections } = await selectCollections({
    collections: [
      { address: moment.collectionAddress, chainId: moment.chainId },
    ],
  });

  const collection = collections?.[0] ?? null;

  const { uri, contentUri, owner, saleConfig, id } =
    await resolveMomentInfo(moment);

  if (!uri) {
    return NextResponse.json(
      { error: 'Invalid moment URI provided' },
      { status: 404 }
    );
  }

  const [metadata, momentAdmins] = await Promise.all([
    getMetadata(id, uri),
    getMomentAdmins({
      collection,
      owner,
      moment,
      protocol: collection?.protocol ?? null,
    }),
  ]);

  return NextResponse.json({
    id,
    uri,
    contentUri,
    owner,
    saleConfig,
    protocol: collection?.protocol ?? null,
    momentAdmins,
    metadata: metadata
      ? await normalizeMetadata(metadata, contentUri ?? undefined)
      : null,
  });
};

export default getMomentHandler;
