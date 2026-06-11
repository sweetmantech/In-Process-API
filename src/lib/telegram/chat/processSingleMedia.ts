import { maxUint64, parseUnits } from 'viem';
import type { Thread, Attachment } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import type { ArtistContext } from '@/types/artist';
import processAttachmentUpload from './processAttachmentUpload';
import sendReadyMessage from './sendReadyMessage';
import sendArtistCollage from './sendArtistCollage';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getCollectionAddress from './getCollectionAddress';
import postMomentPending from './postMomentPending';

const processSingleMedia = async (
  thread: Thread<TelegramThreadState>,
  attachment: Attachment,
  fileId: string,
  name: string,
  artist: ArtistContext,
  thumbFileId?: string
): Promise<void> => {
  await postMomentPending(thread);
  await thread.startTyping();
  let typingInterval: ReturnType<typeof setInterval> | undefined;
  try {
    const { collectionAddress, explicitSelection } = await getCollectionAddress(
      thread,
      artist.primaryWallet
    );
    typingInterval = setInterval(() => void thread.startTyping(), 4000);
    const uploaded = await processAttachmentUpload(
      attachment,
      fileId,
      name,
      artist.primaryWallet,
      thumbFileId
    );

    const contract = collectionAddress
      ? { address: collectionAddress }
      : { name, uri: uploaded.uri };

    const batchInput = createMomentBatchSchema.parse({
      contract,
      tokens: [
        {
          tokenMetadataURI: uploaded.uri,
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

    const { contractAddress, tokenIds } = await createMomentBatch(batchInput);
    const tokenId = tokenIds[0]!;

    if (explicitSelection) {
      await clearSelectedCollectionAddress(thread);
    }

    await sendReadyMessage(thread, contractAddress.toString(), tokenId);
    await sendArtistCollage(thread, artist.primaryWallet);
  } finally {
    if (typingInterval !== undefined) {
      clearInterval(typingInterval);
    }
  }
};

export default processSingleMedia;
