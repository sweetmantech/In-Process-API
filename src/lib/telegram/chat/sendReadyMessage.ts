import type { Thread } from 'chat';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';

const sendReadyMessage = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string
) => {
  const successMessage = getMomentSuccessMessage(contractAddress, tokenId);
  await thread.post(successMessage);
};

export default sendReadyMessage;
