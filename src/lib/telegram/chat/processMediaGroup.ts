import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from './telegramThreadState';
import type { PreparedMomentInput } from './prepareMediaGroupAsset';
import createMoments from '@/lib/moment/createMoments';
import handleMomentSuccess from './handleMomentSuccess';

const processMediaGroup = async (
  thread: Thread<TelegramThreadState>,
  mediaGroupId: string,
  artistAddress: Address
): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateAdapter = (thread as any)._stateAdapter;
  const assets = (await stateAdapter.getList(
    `media_group_assets:${mediaGroupId}`
  )) as PreparedMomentInput[];

  if (assets.length === 0) return;

  await thread.startTyping();
  const typingInterval = setInterval(() => void thread.startTyping(), 4000);
  try {
    const results = await createMoments(assets, artistAddress, 'telegram');
    await Promise.all(
      results.map(({ contractAddress, tokenId }) =>
        handleMomentSuccess(
          thread,
          contractAddress.toString(),
          tokenId,
          artistAddress
        )
      )
    );
  } finally {
    clearInterval(typingInterval);
  }
};

export default processMediaGroup;
