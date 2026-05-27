import { Address } from 'viem';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import resolveAddressToEns from '@/lib/ens/resolveAddressToEns';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const getArtistProfile = async (address: string) => {
  try {
    const ensName = await resolveAddressToEns(address as Address);

    const { data } = await selectArtists({ address });
    const profile = data?.[0];
    if (profile) return { ...profile, username: profile.username || ensName };

    await upsertArtists([
      { address: address.toLowerCase(), username: ensName },
    ]);
    return {
      username: ensName,
      bio: null,
      instagram: null,
      x: null,
      telegram: null,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getArtistProfile;
