import { maxUint64, parseUnits, type Address } from 'viem';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { createMoment } from '@/lib/moment/createMoment';
import { MomentType } from '@/types/moment';

const createMomentFromTelegramAttachment = async ({
  uri,
  name,
  artistAddress,
}: {
  uri: string;
  name: string;
  artistAddress: Address;
}) => {
  const { contractAddress, tokenId } = await createMoment({
    contract: { name, uri },
    token: {
      tokenMetadataURI: uri,
      createReferral: REFERRAL_RECIPIENT as Address,
      salesConfig: {
        type: MomentType.Erc20Mint,
        pricePerToken: parseUnits('1', 6),
        saleStart: BigInt(Math.floor(Date.now() / 1000)),
        saleEnd: maxUint64,
        currency: USDC_ADDRESS[CHAIN_ID],
      },
      mintToCreatorCount: 1,
      payoutRecipient: artistAddress,
    },
    account: artistAddress,
    channel: 'telegram',
  });

  return { contractAddress, tokenId };
};

export default createMomentFromTelegramAttachment;
