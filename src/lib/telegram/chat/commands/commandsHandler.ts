import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import type { Tables } from '@/lib/supabase/types';
import handleWelcome from './handleWelcome';
import handleStart from './handleStart';
import handleRemind from './handleRemind';

const commandsHandler = async (
  text: string,
  thread: Thread<TelegramThreadState>,
  chatId: string,
  telegramUsername: string,
  artist: Tables<'in_process_artists'> | null
): Promise<boolean> => {
  if (!artist) {
    await handleWelcome(thread, chatId, text);
    return true;
  }

  const artistAddress = artist.address as Address;

  switch (text) {
    case '/start':
      await handleStart(
        thread,
        chatId,
        artistAddress,
        artist.username,
        telegramUsername
      );
      return true;
    case '/remind':
      await handleRemind(thread, chatId, artistAddress, artist.nudge_enabled);
      return true;
    default:
      return false;
  }
};

export default commandsHandler;
