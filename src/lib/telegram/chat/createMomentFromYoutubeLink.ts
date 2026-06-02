import { maxUint64, parseUnits } from 'viem';
import type { ArtistContext } from '@/types/artist';
import getYoutubeDetail from '@/lib/link/getYoutubeDetail';
import uploadYtDetails from '@/lib/link/uploadYtDetails';
import type { CreateContractResult } from '@/lib/schema/createMomentSchema';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import type { Address } from 'viem';

const createMomentFromYoutubeLink = async (
  url: string,
  artist: ArtistContext,
  existingCollectionAddress?: Address
): Promise<CreateContractResult> => {
  const detail = await getYoutubeDetail(url);
  if (!detail) throw new Error('Failed to fetch YouTube details');

  const { metadataUri } = await uploadYtDetails(
    detail,
    url,
    artist.primaryWallet
  );

  const contract = existingCollectionAddress
    ? { address: existingCollectionAddress }
    : { name: detail.title || 'Untitled Video', uri: metadataUri };

  const batchInput = createMomentBatchSchema.parse({
    contract,
    tokens: [
      {
        tokenMetadataURI: metadataUri,
        createReferral: REFERRAL_RECIPIENT,
        salesConfig: {
          type: MomentType.Erc20Mint,
          pricePerToken: parseUnits('1', 6).toString(),
          saleStart: Math.floor(Date.now() / 1000),
          saleEnd: maxUint64.toString(),
          currency: USDC_ADDRESS[CHAIN_ID],
        },
        mintToCreatorCount: 1,
        payoutRecipient: artist.primaryWallet,
      },
    ],
    account: artist.primaryWallet,
    channel: 'telegram',
  });

  const { contractAddress, tokenIds, hash, chainId } = await createMomentBatch(
    batchInput,
    artist
  );

  return {
    contractAddress,
    tokenId: tokenIds[0]!,
    hash,
    chainId,
  };
};

export default createMomentFromYoutubeLink;
