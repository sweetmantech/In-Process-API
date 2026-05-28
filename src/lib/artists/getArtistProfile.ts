import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import selectPhone from '@/lib/supabase/in_process_artist_phones/selectPhone';
import resolveAddressToEns from '@/lib/ens/resolveAddressToEns';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

const getArtistProfile = async (address: string) => {
  try {
    const normalized = address.toLowerCase();
    const ensName = await resolveAddressToEns(address as Address);

    const [upserted] = await upsertWallets([{ address: normalized }]);
    const profile = upserted.artist;
    if (profile) {
      let phone;
      if (upserted.artist_id) {
        const { data, error: phoneError } = await selectPhone({
          artist_id: upserted.artist_id,
        });
        if (phoneError) throw phoneError;
        phone = data ?? undefined;
      }
      return {
        ...profile,
        username: profile.username || ensName,
        phone,
      };
    }

    const [created] = await upsertArtists({ username: ensName });
    if (!created) throw new Error('Failed to create artist entity');

    await upsertWallets([{ address: normalized, artist: created.id }]);

    return {
      id: created.id,
      username: ensName,
      bio: null,
      instagram: null,
      x: null,
      telegram: null,
      phone: undefined,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getArtistProfile;
