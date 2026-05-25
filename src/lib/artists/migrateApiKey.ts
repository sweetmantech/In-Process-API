import { getApiKeys } from '@/lib/supabase/in_process_api_keys/getApiKeys';
import { updateApiKey } from '@/lib/supabase/in_process_api_keys/updateApiKey';

const migrateApiKey = async ({ from, to }: { from: string; to: string }) => {
  try {
    const fromLc = from.toLowerCase();
    const toLc = to.toLowerCase();

    const { data: apiKeys, error: fetchError } = await getApiKeys(fromLc);
    if (fetchError) throw fetchError;
    if (!apiKeys?.length) return;

    const apiKeyId = apiKeys[0].id;
    const { error: updateError } = await updateApiKey(apiKeyId, toLc);
    if (updateError) throw updateError;

    console.log(`✅ migrated api keys from ${from} to ${to}`);
  } catch (error) {
    console.error(`❌ migrateApiKey: ${error}`);
    throw new Error(
      `❌ migrateApiKey: Failed to migrate api key from ${from} to ${to}`
    );
  }
};

export default migrateApiKey;
