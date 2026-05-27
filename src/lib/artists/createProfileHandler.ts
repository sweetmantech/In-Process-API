import type { Address } from 'viem';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const createProfileHandler = async ({
  address,
  username,
  bio,
  instagram,
  x,
  telegram,
}: {
  address: Address;
  username?: string;
  bio?: string;
  instagram?: string;
  x?: string;
  telegram?: string;
}) => {
  await upsertArtists({
    address,
    username,
    bio,
    instagram,
    x,
    telegram,
  });

  return Response.json({ success: true });
};

export default createProfileHandler;
