import type { Thread } from 'chat';
import type { TelegramThreadState } from '@/lib/telegram/chat/telegramThreadState';
import type { TelegramArtist } from '../handlers/getArtistByTelegram';
import handleStart from './handleStart';
import handleRemind from './handleRemind';
import handleNotify from './handleNotify';
import handleCollections from './handleCollections';
import handleMe from './handleMe';
import handleHelp from './handleHelp';

const commandsHandler = async (
  text: string,
  thread: Thread<TelegramThreadState>,
  telegramUsername: string,
  artist: TelegramArtist
): Promise<boolean> => {
  const { primaryWallet, username } = artist;
  switch (text) {
    case '/start':
      await handleStart(thread, username, telegramUsername);
      return true;
    case '/remind':
      await handleRemind(thread, primaryWallet);
      return true;
    case '/notify':
      await handleNotify(thread, primaryWallet);
      return true;
    case '/collections':
      await handleCollections(thread, primaryWallet);
      return true;
    case '/me':
      await handleMe(thread, primaryWallet);
      return true;
    case '/help':
      await handleHelp(thread);
      return true;
    default:
      return false;
  }
};

export default commandsHandler;
