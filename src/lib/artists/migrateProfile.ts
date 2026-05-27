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
        instagram:
          artistExistingProfile?.instagram || existingProfile?.instagram,
        x: artistExistingProfile?.x || existingProfile?.x,
        telegram: artistExistingProfile?.telegram || existingProfile?.telegram,
      },
    ]);

    await upsertArtists([
      {
        address: social_wallet.toLowerCase(),
        username: '',
        bio: '',
        instagram: '',
        x: '',
        telegram: '',
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
