import { maxUint64, parseUnits, type Address } from 'viem';
import type { ArtistContext } from '@/types/artist';
import type { CreateContractResult } from '@/lib/schema/createMomentSchema';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import uploadWritingWithJson from '@/lib/writing/uploadWritingWithJson';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import deriveTextMomentTitle from './deriveTextMomentTitle';

const createMomentFromText = async (
  content: string,
  artist: ArtistContext,
  existingCollectionAddress?: Address
): Promise<CreateContractResult> => {
  const title = deriveTextMomentTitle(content);
  const metadataUri = await uploadWritingWithJson(title, content);

  const contract = existingCollectionAddress
    ? { address: existingCollectionAddress }
    : { name: title, uri: metadataUri };

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

  const { contractAddress, tokenIds, hash, chainId } =
    await createMomentBatch(batchInput);

  return {
    contractAddress,
    tokenId: tokenIds[0]!,
    hash,
    chainId,
  };
};

export default createMomentFromText;
