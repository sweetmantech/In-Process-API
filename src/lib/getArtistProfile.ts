import { Address } from 'viem';
import selectArtists from './supabase/in_process_artists/selectArtists';
import resolveAddressToEns from './ens/resolveAddressToEns';

const getArtistProfile = async (address: string) => {
  const emptyFields = {
    username: '',
    bio: '',
    farcaster_username: '',
    instagram_username: '',
    twitter_username: '',
    telegram_username: '',
  };
  try {
    const ensName = await resolveAddressToEns(address as Address);

    const { data } = await selectArtists({ address });
    const profile = data?.[0];
    if (profile)
      return {
        ...profile,
        username: profile.username || ensName,
        phone: profile.phone ? profile.phone[0] : undefined,
      };

    return {
      ...emptyFields,
      username: ensName,
    };
  } catch (error) {
    console.error(error);
    return emptyFields;
  }
};

export default getArtistProfile;
