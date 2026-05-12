import { maxUint64, parseUnits, type Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import processAttachmentUpload from './processAttachmentUpload';
import replyAfterSuccess from './replyAfterSuccess';
import createMomentBatch from '@/lib/moment/createMomentBatch';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import type { TelegramThreadState } from './telegramThreadState';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getSelectedCollectionAddress from './getSelectedCollectionAddress';
import postMomentPending from './postMomentPending';

const processSingleMedia = async (
  thread: Thread<TelegramThreadState>,
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: Address,
  thumbFileId?: string
): Promise<void> => {
  await postMomentPending(thread);
  await thread.startTyping();
  let typingInterval: ReturnType<typeof setInterval> | undefined;
  try {
    const selectedCollection = await getSelectedCollectionAddress(thread);
    typingInterval = setInterval(() => void thread.startTyping(), 4000);
    const uploaded = await processAttachmentUpload(
      attachment,
      fileId,
      name,
      artistAddress,
      thumbFileId
    );

    const contract = selectedCollection
      ? { address: selectedCollection }
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
          payoutRecipient: artistAddress,
        },
      ],
      account: artistAddress,
      channel: 'telegram',
    });

    const { contractAddress, tokenIds } = await createMomentBatch(batchInput);
    const tokenId = tokenIds[0]!;

    if (selectedCollection) {
      await clearSelectedCollectionAddress(thread);
    }

    await replyAfterSuccess(
      thread,
      contractAddress.toString(),
      tokenId,
      artistAddress
    );
  } finally {
    if (typingInterval !== undefined) {
      clearInterval(typingInterval);
    }
  }
};

export default processSingleMedia;
