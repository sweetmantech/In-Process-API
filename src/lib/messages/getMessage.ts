import { logger } from '@trigger.dev/sdk';

const getMessage = async (messageId: string) => {
  try {
    const response = await fetch(
      `https://api.inprocess.world/message/${messageId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to get message: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error getting message', {
      error: error?.message ?? 'Unknown error',
      messageId,
    });
    throw error;
  }
};

export default getMessage;
