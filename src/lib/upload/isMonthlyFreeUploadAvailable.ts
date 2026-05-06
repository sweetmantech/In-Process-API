import getCompletedFreeUploads from '@/lib/supabase/in_process_arweave_uploads/getCompletedFreeUploads';
import { FREE_UPLOADS_PER_MONTH } from '@/lib/consts';

type MonthlyFreeUploadAvailability =
  | { available: boolean }
  | { error: string; status: 500 };

const isMonthlyFreeUploadAvailable = async (
  artistAddress: string
): Promise<MonthlyFreeUploadAvailability> => {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
  ).toISOString();

  const { count, error } = await getCompletedFreeUploads(
    artistAddress,
    monthStart,
    monthEnd
  );
  if (error) {
    console.error('getCompletedFreeUploads', error);
    return { error: 'Failed to check upload quota', status: 500 };
  }

  return { available: (count ?? 0) < FREE_UPLOADS_PER_MONTH };
};

export default isMonthlyFreeUploadAvailable;
