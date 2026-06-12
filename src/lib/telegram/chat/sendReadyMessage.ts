import type { Thread } from 'chat';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';
import getMomentsSuccessMessage from '@/lib/moment/getMomentsSuccessMessage';

const sendReadyMessage = async (
  thread: Thread,
  contractAddress: string,
  tokenIds: string | string[]
) => {
  const message = Array.isArray(tokenIds)
    ? getMomentsSuccessMessage(contractAddress, tokenIds)
    : getMomentSuccessMessage(contractAddress, tokenIds);
  await thread.post(message);
};

export default sendReadyMessage;
