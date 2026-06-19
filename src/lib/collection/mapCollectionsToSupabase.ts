import blockTsToISOString from '@/lib/blockTsToISOString';
import type {
  Catalog_Collections_t,
  InProcess_Collections_t,
  Sound_Editions_t,
  Zora_Collections_t,
} from '@/types/envio';
import type { Database } from '@/lib/supabase/types';

type CollectionProtocol = Database['public']['Enums']['collection_protocol'];

export function mapCollectionsToSupabase(
  collections:
    | InProcess_Collections_t[]
    | Catalog_Collections_t[]
    | Sound_Editions_t[]
    | Zora_Collections_t[],
  protocol: CollectionProtocol
): Array<Database['public']['Tables']['in_process_collections']['Insert']> {
  return collections.map((c) => ({
    address: c.address,
    name: c.name,
    uri: c.uri,
    creator:
      'owner' in c ? c.owner : 'creator' in c ? c.creator : c.default_admin,
    chain_id: c.chain_id,
    created_at: blockTsToISOString(c.created_at),
    updated_at: blockTsToISOString(c.updated_at),
    protocol,
  }));
}
