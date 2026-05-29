import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock(
  '@/lib/supabase/account_notifications/upsertAccountNotification',
  () => ({
    default: vi.fn(),
  })
);
vi.mock('@/lib/telegram/parseTelegramChatId', () => ({ default: vi.fn() }));
vi.mock('../../commands/commandsHandler', () => ({ default: vi.fn() }));
vi.mock('../../processMediaThread', () => ({ default: vi.fn() }));
vi.mock('../../processYoutubeLink', () => ({ default: vi.fn() }));
vi.mock('@/lib/link/youtubeParser', () => ({ default: vi.fn() }));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertAccountNotification from '@/lib/supabase/account_notifications/upsertAccountNotification';
import parseTelegramChatId from '@/lib/telegram/parseTelegramChatId';
import commandsHandler from '../../commands/commandsHandler';
import processMediaThread from '../../processMediaThread';
import processYoutubeLink from '../../processYoutubeLink';
import youtubeParser from '@/lib/link/youtubeParser';
import { registerOnNewMention } from '../onNewMention';
import type { TelegramChatBot } from '../../bot';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ARTIST_CONTEXT = {
  artistId: ARTIST_ID,
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};
const CHANNEL_ID = 'telegram:1352384640';
const RAW_CHAT_ID = '1352384640';

const ARTIST = {
  id: ARTIST_ID,
  address: ARTIST_ADDRESS,
  username: 'alice',
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' }],
};

const makeMessage = (overrides = {}) => ({
  author: { userName: 'testuser' },
  text: '',
  attachments: [],
  ...overrides,
});

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
  channelId: CHANNEL_ID,
  _stateAdapter: {
    get: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(undefined),
  },
});

let capturedHandler: ((thread: any, message: any) => Promise<void>) | undefined;

const mockBot = {
  onNewMention: vi.fn((fn) => {
    capturedHandler = fn;
  }),
} as unknown as TelegramChatBot;

beforeEach(() => {
  vi.clearAllMocks();
  capturedHandler = undefined;
  vi.mocked(parseTelegramChatId).mockReturnValue(RAW_CHAT_ID);
  vi.mocked(selectArtists).mockResolvedValue({
    data: [ARTIST],
    error: null,
  } as never);
  vi.mocked(upsertAccountNotification).mockResolvedValue({
    data: null,
    error: null,
  } as never);
  vi.mocked(commandsHandler).mockResolvedValue(false);
  vi.mocked(processMediaThread).mockResolvedValue(undefined);
  vi.mocked(processYoutubeLink).mockResolvedValue(undefined);
  vi.mocked(youtubeParser).mockReturnValue(false);

  registerOnNewMention(mockBot);
});

describe('onNewMention', () => {
  it('returns early when telegramUsername is missing', async () => {
    const message = makeMessage({ author: { userName: undefined } });
    await capturedHandler!(makeThread(), message);

    expect(selectArtists).not.toHaveBeenCalled();
  });

  it('saves telegram_chat_id for known artist', async () => {
    await capturedHandler!(makeThread(), makeMessage({ text: 'hello' }));

    expect(upsertAccountNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet: ARTIST_ADDRESS,
        telegram_chat_id: RAW_CHAT_ID,
      })
    );
  });

  it('does not save telegram_chat_id for unknown artist', async () => {
    vi.mocked(selectArtists).mockResolvedValue({
      data: [],
      error: null,
    } as never);

    await capturedHandler!(makeThread(), makeMessage());

    expect(upsertAccountNotification).not.toHaveBeenCalled();
  });

  it('delegates to commandsHandler and returns when handled', async () => {
    vi.mocked(commandsHandler).mockResolvedValue(true);

    await capturedHandler!(makeThread(), makeMessage({ text: '/start' }));

    expect(processMediaThread).not.toHaveBeenCalled();
  });

  it('processes image attachment when present', async () => {
    const attachment = { type: 'image', mimeType: 'image/jpeg' };
    const message = makeMessage({ attachments: [attachment] });

    await capturedHandler!(makeThread(), message);

    expect(processMediaThread).toHaveBeenCalled();
  });

  it('posts fallback message for unrecognised text without attachment', async () => {
    const thread = makeThread();

    await capturedHandler!(thread, makeMessage({ text: 'random text' }));

    expect(thread.post).toHaveBeenCalledWith(
      'Please send a photo or video with a caption.'
    );
  });

  it('delegates a valid YouTube URL to processYoutubeLink', async () => {
    vi.mocked(youtubeParser).mockReturnValue('dQw4w9WgXcQ');
    const thread = makeThread();
    const yt = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    await capturedHandler!(thread, makeMessage({ text: `listen ${yt}` }));

    expect(processYoutubeLink).toHaveBeenCalledWith(thread, yt, ARTIST_CONTEXT);
  });
});
