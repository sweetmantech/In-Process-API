import type {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
} from '@/types/envio';
import { indexerChannel } from '@/lib/supabase/client';

export function broadcastAdminUpdated(
  admins: (InProcess_Admins_t | Catalog_Admins_t | Sound_Admins_t)[]
): void {
  const seen = new Set<string>();

  Promise.all(
    admins.flatMap((admin) => {
      const isMoment = Number(admin.token_id) !== 0;
      const key = isMoment
        ? `${admin.collection}:${admin.token_id}:${admin.chain_id}`
        : `${admin.collection}:${admin.chain_id}`;

      if (seen.has(key)) return [];
      seen.add(key);

      return indexerChannel.send({
        type: 'broadcast',
        event: `${isMoment ? 'moment' : 'collection'}:admin:updated`,
        payload: {
          collectionAddress: admin.collection,
          chainId: admin.chain_id,
          ...(isMoment && { tokenId: Number(admin.token_id) }),
        },
      });
    })
  ).catch(console.error);
}
