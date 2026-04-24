import type { Address } from 'viem';
import type { Thread } from 'chat';
import type { TelegramThreadState } from '../telegramThreadState';
import type { Tables } from '@/lib/supabase/types';
import handleWelcome from './handleWelcome';
import handleStart from './handleStart';
import handleRemind from './handleRemind';
import handleNotify from './handleNotify';

const commandsHandler = async (
  text: string,
  thread: Thread<TelegramThreadState>,
  telegramUsername: string,
  artist: Tables<'in_process_artists'> | null
): Promise<boolean> => {
  if (!artist) {
    await handleWelcome(thread, text);
    return true;
  }

  const artistAddress = artist.address as Address;

  switch (text) {
    case '/start':
      await handleStart(
        thread,
        artistAddress,
        artist.username,
        telegramUsername
      );
      return true;
    case '/remind':
      await handleRemind(thread, artistAddress);
      return true;
    case '/notify':
      await handleNotify(thread, artistAddress);
      return true;
    default:
      return false;
  }
};

export default commandsHandler;
