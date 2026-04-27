import { maxUint64, parseUnits, type Address } from 'viem';
import type { Thread, Attachment } from 'chat';
import uploadAndLogAttachment from './uploadAndLogAttachment';
import replyAfterSuccess from './replyAfterSuccess';
import { createMoment } from '@/lib/moment/createMoment';
import { CHAIN_ID, REFERRAL_RECIPIENT, USDC_ADDRESS } from '@/lib/consts';
import { MomentType } from '@/types/moment';
import type { TelegramThreadState } from './telegramThreadState';
import clearSelectedCollectionAddress from './clearSelectedCollectionAddress';
import getSelectedCollectionAddress from './getSelectedCollectionAddress';

const processSingleMedia = async (
  thread: Thread<TelegramThreadState>,
  attachment: Attachment,
  fileId: string,
  name: string,
  artistAddress: Address,
  thumbFileId?: string
): Promise<void> => {
  await thread.post(
    '⏳ In Process will post your moment. Please wait a few seconds...'
  );
  await thread.startTyping();
  const typingInterval = setInterval(() => void thread.startTyping(), 4000);
  const selectedCollection = await getSelectedCollectionAddress(thread);
  try {
    const uploaded = await uploadAndLogAttachment(
      attachment,
      fileId,
      name,
      artistAddress,
      thread.channelId,
      thumbFileId
    );

    const { contractAddress, tokenId } = await createMoment(
      {
        contract: selectedCollection
          ? { address: selectedCollection }
          : { name, uri: uploaded.uri },
        token: {
          tokenMetadataURI: uploaded.uri,
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
      },
      { chatId: thread.channelId }
    );

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
    clearInterval(typingInterval);
  }
};

export default processSingleMedia;
