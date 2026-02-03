import handleGetMessage from './handleGetMessage';
import handleGetMessages from './handleGetMessages';

const getMessagesHandler = async ({
  artistAddress,
  messageId,
  moment,
  page = 1,
  limit = 10,
}: {
  artistAddress: string;
  messageId?: string;
  moment?: string;
  page?: number;
  limit?: number;
}) => {
  if (messageId) return handleGetMessage({ messageId });

  if (artistAddress)
    return handleGetMessages({
      artistAddress,
      moment: moment === 'true' ? true : false,
      page,
      limit,
    });
};

export default getMessagesHandler;
