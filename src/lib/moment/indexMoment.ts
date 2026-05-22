import { getAddress, type Address } from 'viem';
import type { z } from 'zod';
import { CHAIN_ID } from '@/lib/consts';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';

type CreateMomentContractInput = z.infer<typeof createMomentSchema>;

export type IndexMomentParams = {
  contractAddress: Address;
  tokenId: string;
  artistAddress: string;
  channel?: CreateMomentContractInput['channel'];
  token: Pick<
    CreateMomentContractInput['token'],
    'tokenMetadataURI' | 'maxSupply'
  >;
  chainId?: number;
};

const indexMoment = async ({
  contractAddress,
  tokenId,
  artistAddress,
  channel,
  token,
  chainId,
}: IndexMomentParams) => {
  const resolvedChainId = chainId ?? CHAIN_ID;
  const artist = getAddress(artistAddress).toLowerCase();
  const normalizedAddress = getAddress(contractAddress).toLowerCase();
  await ensureArtists([artist]);

  const { data: collections } = await selectCollections({
    addresses: [normalizedAddress],
    chainId: resolvedChainId,
  });
  const existingCollection = collections?.[0] ?? null;

  let collectionId = existingCollection?.id ?? '';
  if (!existingCollection?.id) {
    const placeholder = new Date(0).toISOString();
    const upserted = await upsertCollections([
      {
        address: normalizedAddress,
        chain_id: resolvedChainId,
        creator: artist,
        protocol: 'in_process',
        created_at: placeholder,
        updated_at: placeholder,
        uri: '',
        name: '',
      },
    ]);
    collectionId = upserted[0]?.id ?? '';
  }
  if (!collectionId) return;

  const { data: existingMoments } = await selectMoments({
    moments: [
      {
        collectionAddress: normalizedAddress as Address,
        tokenId,
        chainId: resolvedChainId,
      },
    ],
    chainId: resolvedChainId,
    limit: 1,
  });

  if (!existingMoments?.[0]?.id) {
    const placeholder = new Date(0).toISOString();
    await upsertMoments([
      {
        collection: collectionId,
        token_id: Number(tokenId),
        uri: token.tokenMetadataURI,
        max_supply: token.maxSupply ?? 0,
        created_at: placeholder,
        updated_at: placeholder,
        ...(channel && { channel }),
      },
    ]);
  }
};

export default indexMoment;
