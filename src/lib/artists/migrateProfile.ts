import selectArtists from '../supabase/in_process_artists/selectArtists';
import { upsertArtists } from '../supabase/in_process_artists/upsertArtists';

const migrateProfile = async ({
  social_wallet,
  artist_wallet,
}: {
  social_wallet: string;
  artist_wallet: string;
}) => {
  try {
    const { data: existingData } = await selectArtists({
      address: social_wallet,
    });
    const existingProfile = existingData?.[0];
    const { data: artistData } = await selectArtists({
      address: artist_wallet,
    });
    const artistExistingProfile = artistData?.[0];

    await upsertArtists([
      {
        address: artist_wallet.toLowerCase(),
        username: artistExistingProfile?.username || existingProfile?.username,
        bio: artistExistingProfile?.bio || existingProfile?.bio,
        farcaster_username:
          artistExistingProfile?.farcaster_username ||
          existingProfile?.farcaster_username,
        instagram_username:
          artistExistingProfile?.instagram_username ||
          existingProfile?.instagram_username,
        twitter_username:
          artistExistingProfile?.twitter_username ||
          existingProfile?.twitter_username,
        telegram_username:
          artistExistingProfile?.telegram_username ||
          existingProfile?.telegram_username,
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

    console.log(
      `✅ migrated profile from social wallet to artist wallet: ${artist_wallet}`
    );
  } catch (error) {
    console.error(`❌ migrateProfile: ${error}`);
    throw new Error(`❌ migrateProfile: ${error}`);
  }
};

export default migrateProfile;
