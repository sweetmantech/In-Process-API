import { NextResponse } from 'next/server';
import normalizeMetadata from '@/lib/metadata/normalizeMetadata';
import getMetadata from '@/lib/moment/getMetadata';
import getMomentAdmins from '@/lib/moment/getMomentAdmins';
import { resolveMomentInfo } from '@/lib/moment/resolveMomentInfo';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import getZoraMediaInfo from '@/lib/viem/getZoraMediaInfo';
import { Moment } from '@/types/moment';

const getMomentHandler = async (moment: Moment) => {
  const { data: collections } = await selectCollections({
    collections: [
      { address: moment.collectionAddress, chainId: moment.chainId },
    ],
  });

  const collection = collections?.[0] ?? null;
  const protocol = collection?.protocol ?? null;

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
    getMomentAdmins({ collection, owner, moment, protocol }),
  ]);

  let resolvedOwner = owner;
  if (protocol === 'zora_media') {
    if (momentAdmins[0]) {
      resolvedOwner = momentAdmins[0];
    } else {
      const { owner: onChainOwner } = await getZoraMediaInfo(moment);
      resolvedOwner = onChainOwner ?? owner;
    }
  }

  return NextResponse.json({
    id,
    uri,
    contentUri,
    owner: resolvedOwner,
    saleConfig,
    protocol,
    momentAdmins,
    metadata: metadata
      ? await normalizeMetadata(metadata, contentUri ?? undefined)
      : null,
  });
};

export default getMomentHandler;
