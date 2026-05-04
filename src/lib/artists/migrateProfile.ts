import { getProfile } from '../supabase/in_process_artists/getProfile';
import { upsertArtists } from '../supabase/in_process_artists/upsertArtists';

const migrateProfile = async ({
  social_wallet,
  artist_wallet,
}: {
  social_wallet: string;
  artist_wallet: string;
}) => {
  try {
    const existingProfile = await getProfile(social_wallet);

    await upsertArtists([
      {
        address: artist_wallet.toLowerCase(),
        username: existingProfile?.username,
        bio: existingProfile?.bio,
        farcaster_username: existingProfile?.farcaster_username,
        instagram_username: existingProfile?.instagram_username,
        twitter_username: existingProfile?.twitter_username,
        telegram_username: existingProfile?.telegram_username,
      },
    ]);

    await upsertArtists([
      {
        address: social_wallet.toLowerCase(),
        username: '',
        bio: '',
        farcaster_username: '',
        instagram_username: '',
        twitter_username: '',
        telegram_username: '',
      },
    ]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to migrate profile');
  }
};

export default migrateProfile;
