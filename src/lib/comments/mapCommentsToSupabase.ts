import blockTsToISOString from '@/lib/blockTsToISOString';
import type { InProcess_Comments_t } from '@/types/envio';
import type { Database } from '@/lib/supabase/types';
import { getMomentIdMap } from '@/lib/moment/getMomentIdMap';
import resolveArtistAddressFromMaybeSmartWallet from '@/lib/wallets/resolveArtistAddressFromMaybeSmartWallet';
import { Address } from 'viem';

export async function mapCommentsToSupabase(
  momentComments: InProcess_Comments_t[]
): Promise<
  Database['public']['Tables']['in_process_moment_comments']['Insert'][]
> {
  const mappedComments: Array<
    Database['public']['Tables']['in_process_moment_comments']['Insert']
  > = [];
  const momentIdMap = await getMomentIdMap(momentComments);

  const artistAddressBySenderKey = new Map<string, string>();
  await Promise.all(
    [
      ...new Map(
        momentComments.map((comment) => [
          `${comment.sender.toLowerCase()}:${comment.chain_id}`,
          comment,
        ])
      ).values(),
    ].map(async (comment) => {
      const key = `${comment.sender.toLowerCase()}:${comment.chain_id}`;
      const artistAddress = await resolveArtistAddressFromMaybeSmartWallet({
        address: comment.sender as Address,
        chainId: comment.chain_id,
      });
      artistAddressBySenderKey.set(key, artistAddress);
    })
  );

  for (const comment of momentComments) {
    const tripletKey = `${comment.collection.toLowerCase()}:${comment.chain_id}:${comment.token_id}`;
    const momentId = momentIdMap.get(tripletKey);
    if (momentId) {
      const senderKey = `${comment.sender.toLowerCase()}:${comment.chain_id}`;
      mappedComments.push({
        moment: momentId,
        artist_address:
          artistAddressBySenderKey.get(senderKey) ??
          comment.sender.toLowerCase(),
        comment: comment.comment ?? null,
        commented_at: blockTsToISOString(comment.commented_at),
        comment_id: comment.comment_id ?? null,
        reply_to_id: comment.reply_to_id ?? null,
        nonce: comment.nonce ?? null,
        sparks_quantity:
          comment.sparks_quantity === undefined ||
          comment.sparks_quantity === null
            ? null
            : Number(comment.sparks_quantity),
      });
    }
  }

  return mappedComments;
}
