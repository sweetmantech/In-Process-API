import { getAddress, type Address } from 'viem';
import type { z } from 'zod';
import { CHAIN_ID } from '@/lib/consts';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import { ensureArtists } from '@/lib/artists/ensureArtists';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import { logMessage } from '@/lib/messages/logMessage';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';
import type { Database } from '@/lib/supabase/types';

type CreateMomentContractInput = z.infer<typeof createMomentSchema>;

type IndexMessageMomentParams = {
  contractAddress: Address;
  tokenId: string;
  artistAddress: string;
  channel?: CreateMomentContractInput['channel'];
  chatId?: string;
  contract: CreateMomentContractInput['contract'];
  token: Pick<
    CreateMomentContractInput['token'],
    'tokenMetadataURI' | 'maxSupply'
  >;
};

const indexMessageMoment = async ({
  contractAddress,
  tokenId,
  artistAddress,
  channel,
  chatId,
  contract,
  token,
}: IndexMessageMomentParams) => {
  const artist = getAddress(artistAddress).toLowerCase();
  const normalizedAddress = getAddress(contractAddress).toLowerCase();
  await ensureArtists([artist]);

  const { data: existingCollections } = await selectCollections({
    collections: [{ address: normalizedAddress, chainId: CHAIN_ID }],
    limit: 1,
  });

  let collectionId = existingCollections?.[0]?.id ?? '';
  if (!existingCollections?.[0]?.id) {
    const placeholder = new Date(0).toISOString();
    const collections = await upsertCollections([
      {
        address: normalizedAddress,
        chain_id: CHAIN_ID,
        creator: artist,
        protocol: 'in_process',
        created_at: placeholder,
        updated_at: placeholder,
        ...(contract.name && { name: contract.name }),
        ...(contract.uri && { uri: contract.uri }),
      } as Database['public']['Tables']['in_process_collections']['Insert'],
    ]);
    collectionId = collections[0]?.id ?? '';
  }
  if (!collectionId) return;

  const { data: existingMoments } = await selectMoments({
    moments: [
      {
        collectionAddress: normalizedAddress as Address,
        tokenId,
        chainId: CHAIN_ID,
      },
    ],
    chainId: CHAIN_ID,
    limit: 1,
  });

  let momentId = existingMoments?.[0]?.id;
  if (!momentId) {
    const placeholder = new Date(0).toISOString();
    const moments = await upsertMoments([
      {
        collection: collectionId,
        token_id: Number(tokenId),
        uri: token.tokenMetadataURI,
        max_supply: token.maxSupply ?? 0,
        created_at: placeholder,
        updated_at: placeholder,
      },
    ]);
    momentId = moments[0]?.id;
  }
  if (!momentId) return;

  const successMessage = getMomentSuccessMessage(contractAddress, tokenId);
  const messageId = await logMessage(
    [{ type: 'text', text: successMessage }],
    'assistant',
    chatId,
    artist,
    (channel ?? 'sms') as 'sms' | 'telegram' | 'web' | 'api'
  );

  if (!messageId) return;

  await upsertMessageMoment({
    message: messageId,
    moment: momentId,
  });
};

export default indexMessageMoment;
