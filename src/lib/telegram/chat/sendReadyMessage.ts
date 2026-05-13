import type { Thread } from 'chat';
import getMomentSuccessMessage from '@/lib/moment/getMomentSuccessMessage';
import pollUntilOgReady from '@/lib/telegram/pollUntilOgReady';

const sendReadyMessage = async (
  thread: Thread,
  contractAddress: string,
  tokenId: string
) => {
  const successMessage = getMomentSuccessMessage(contractAddress, tokenId);
  await pollUntilOgReady(contractAddress, tokenId);
  await thread.post(successMessage);
};

export default sendReadyMessage;
