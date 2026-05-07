import { maxUint64, parseUnits, type Address } from 'viem';
import getYoutubeDetail from '@/lib/link/getYoutubeDetail';
import uploadYtDetails from '@/lib/link/uploadYtDetails';
import { createMoment } from '@/lib/moment/createMoment';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';

const createMomentFromYoutubeLink = async (
  url: string,
  artistAddress: Address,
  existingCollectionAddress?: Address
) => {
  const detail = await getYoutubeDetail(url);
  if (!detail) throw new Error('Failed to fetch YouTube details');

  const { metadataUri } = await uploadYtDetails(detail, url, artistAddress);

  const contract = existingCollectionAddress
    ? { address: existingCollectionAddress }
    : { name: detail.title || 'Untitled Video', uri: metadataUri };

  return createMoment({
    contract,
    token: {
      tokenMetadataURI: metadataUri,
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
};

export default createMomentFromYoutubeLink;
