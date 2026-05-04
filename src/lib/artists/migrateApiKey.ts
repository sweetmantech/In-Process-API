import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateArtistAddress } from '@/lib/supabase/in_process_api_keys/updateArtistAddress';

const migrateApiKey = async ({
  social_wallet,
  artist_wallet,
}: {
  social_wallet: string;
  artist_wallet: string;
}) => {
  try {
    const socialWalletLc = social_wallet.toLowerCase();
    const artistWalletLc = artist_wallet.toLowerCase();

    const { data: apiKeys, error: fetchError } =
      await getApiKeys(socialWalletLc);
    if (fetchError) throw fetchError;
    if (!apiKeys?.length) return;

    const apiKeyId = apiKeys[0].id;
    const { error: updateError } = await updateArtistAddress(
      apiKeyId,
      artistWalletLc
    );
    if (updateError) throw updateError;

    console.log('✅ migrated api keys from social wallet to artist wallet');
  } catch (error) {
    console.error(`❌ migrateApiKey: ${error}`);
    throw new Error('❌ migrateApiKey: Failed to migrate api key');
  }
};

export default migrateApiKey;
