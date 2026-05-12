import type { InboundMessagePayload } from 'telnyx/resources/shared';
import { maxUint64, parseUnits } from 'viem';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { MomentType } from '@/types/moment';
import uploadMetadata from './uploadMetadata';

const createMomentFromMedia = async (
  media: NonNullable<InboundMessagePayload['media']>[number],
  payload: InboundMessagePayload | undefined,
  artistAddress: string
) => {
  const { uri, name } = await uploadMetadata(media, payload, artistAddress);
  const batchInput = createMomentBatchSchema.parse({
    contract: { name, uri },
    tokens: [
      {
        tokenMetadataURI: uri,
        createReferral: REFERRAL_RECIPIENT,
        salesConfig: {
          type: MomentType.Erc20Mint,
          pricePerToken: parseUnits('1', 6).toString(),
          saleStart: Math.floor(Date.now() / 1000),
          saleEnd: maxUint64.toString(),
          currency: USDC_ADDRESS[CHAIN_ID],
        },
        mintToCreatorCount: 1,
        payoutRecipient: artistAddress,
      },
    ],
    account: artistAddress,
    channel: 'sms',
  });
  const { contractAddress, tokenIds } = await createMomentBatch(batchInput);
  return {
    contractAddress,
    tokenId: tokenIds[0]!,
  };
};

export default createMomentFromMedia;
