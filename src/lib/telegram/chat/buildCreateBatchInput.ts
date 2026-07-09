import { maxUint64, parseUnits, type Address } from 'viem';
import type { CreateMomentBatchInput } from '@/lib/moment/createMomentBatch';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import type { PendingMediaGroupAsset } from '@/types/telegram';

type UploadedMediaMeta = { uri: string; captureDate?: number };

const buildCreateBatchInput = (
  pending: PendingMediaGroupAsset[],
  uploaded: UploadedMediaMeta[],
  selectedCollection: Address | null,
  artistAddress: Address
): CreateMomentBatchInput => {
  const uploadTime = Math.floor(Date.now() / 1000);
  const tokens = uploaded.map((u) => ({
    tokenMetadataURI: u.uri,
    createReferral: REFERRAL_RECIPIENT,
    salesConfig: {
      type: MomentType.Erc20Mint,
      pricePerToken: parseUnits('1', 6).toString(),
      // Position the moment on the Timeline by when the photo was actually
      // taken (EXIF) when available; Telegram strips EXIF from compressed
      // "photo" sends, so fall back to upload time in that case.
      saleStart: u.captureDate ?? uploadTime,
      saleEnd: maxUint64.toString(),
      currency: USDC_ADDRESS[CHAIN_ID],
    },
    mintToCreatorCount: 1,
    payoutRecipient: artistAddress,
  }));

  const contract = selectedCollection
    ? { address: selectedCollection }
    : { name: pending[0].name, uri: uploaded[0].uri };

  return createMomentBatchSchema.parse({
    contract,
    tokens,
    account: artistAddress,
    channel: 'telegram',
    chainId: CHAIN_ID,
  });
};

export default buildCreateBatchInput;
