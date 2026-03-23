import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { registerOnNewMention } from '../onNewMention';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));
vi.mock('../../handleTelegramMedia', () => ({ default: vi.fn() }));
vi.mock('../../createMomentFromYoutubeLink', () => ({ default: vi.fn() }));
vi.mock('../../handleMomentSuccess', () => ({ default: vi.fn() }));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import { logMessage } from '@/lib/messages/logMessage';
import handleTelegramMedia from '../../handleTelegramMedia';
import createMomentFromYoutubeLink from '../../createMomentFromYoutubeLink';
import handleMomentSuccess from '../../handleMomentSuccess';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST = { address: ARTIST_ADDRESS, username: 'alice' };

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
});

const makeMessage = (
  overrides: {
    text?: string;
    attachments?: unknown[];
    userName?: string | null;
  } = {}
) => ({
  text: overrides.text ?? '',
  attachments: overrides.attachments ?? [],
  author: {
    userName:
      overrides.userName !== undefined ? overrides.userName : 'testuser',
  },
});

const setup = () => {
  let capturedHandler:
    | ((thread: unknown, message: unknown) => Promise<void>)
    | null = null;
  const bot = {
    onNewMention: vi.fn((handler) => {
      capturedHandler = handler;
    }),
  };
  registerOnNewMention(bot as never);
  const invoke = (thread: unknown, message: unknown) => {
    if (!capturedHandler) throw new Error('handler not registered');
    return capturedHandler(thread, message);
  };
  return { bot, invoke };
};

const MOMENT_RESULT = {
  contractAddress: '0xContract' as Address,
  tokenId: '1',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(selectArtists).mockResolvedValue({
    data: [ARTIST],
    error: null,
  } as never);
  vi.mocked(logMessage).mockResolvedValue('msg-id' as never);
  vi.mocked(createMomentFromYoutubeLink).mockResolvedValue(
    MOMENT_RESULT as never
  );
  vi.mocked(handleMomentSuccess).mockResolvedValue(undefined);
});

describe('registerOnNewMention', () => {
  it('registers a handler with bot.onNewMention', () => {
    const { bot } = setup();
    expect(bot.onNewMention).toHaveBeenCalledOnce();
  });

  describe('when message has no author username', () => {
    it('returns early without posting or querying', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ userName: null }));

      expect(thread.post).not.toHaveBeenCalled();
      expect(selectArtists).not.toHaveBeenCalled();
    });
  });

  describe('when the user is not a linked artist', () => {
    beforeEach(() => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [],
        error: null,
      } as never);
    });

    it('posts the welcome / onboarding message', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: 'hello' }));

      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('inprocess.world/manage')
      );
    });

    it('logs the user message and the assistant welcome reply', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: 'hello' }));

      expect(logMessage).toHaveBeenCalledTimes(2);
      expect(logMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'user',
        undefined,
        'telegram'
      );
      expect(logMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'assistant',
        undefined,
        'telegram'
      );
    });

    it('does not call handleTelegramMedia', async () => {
      const { invoke } = setup();
      await invoke(makeThread(), makeMessage({ text: 'hello' }));
      expect(handleTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when a linked artist sends /start', () => {
    it('posts a personalized welcome with their username', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: '/start' }));

      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('alice')
      );
    });

    it('logs the start message as assistant', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: '/start' }));

      expect(logMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'assistant',
        ARTIST_ADDRESS,
        'telegram'
      );
    });

    it('does not call handleTelegramMedia', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: '/start' }));

      expect(handleTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when a linked artist sends an image', () => {
    it('delegates to handleTelegramMedia', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };
      const message = makeMessage({ attachments: [attachment] });

      await invoke(thread, message);

      expect(handleTelegramMedia).toHaveBeenCalledWith(
        thread,
        message,
        attachment,
        '',
        ARTIST_ADDRESS
      );
    });
  });

  describe('when a linked artist sends a video', () => {
    it('delegates to handleTelegramMedia', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      const attachment = { type: 'video', size: 2000 };
      const message = makeMessage({ attachments: [attachment] });

      await invoke(thread, message);

      expect(handleTelegramMedia).toHaveBeenCalledWith(
        thread,
        message,
        attachment,
        '',
        ARTIST_ADDRESS
      );
    });
  });

  describe('when a linked artist sends text without media', () => {
    it('posts a prompt to send a photo or video', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: 'just text, no media' }));

      expect(thread.post).toHaveBeenCalledWith(
        'Please send a photo or video with a caption.'
      );
      expect(handleTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when a linked artist sends a YouTube link', () => {
    const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    it('calls createMomentFromYoutubeLink with the URL and artist address', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: YOUTUBE_URL }));

      expect(createMomentFromYoutubeLink).toHaveBeenCalledWith(
        YOUTUBE_URL,
        ARTIST_ADDRESS
      );
    });

    it('calls handleMomentSuccess with the created moment details', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: YOUTUBE_URL }));

      expect(handleMomentSuccess).toHaveBeenCalledWith(
        thread,
        MOMENT_RESULT.contractAddress,
        MOMENT_RESULT.tokenId,
        ARTIST_ADDRESS
      );
    });

    it('does not post the fallback prompt', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: YOUTUBE_URL }));

      expect(thread.post).not.toHaveBeenCalledWith(
        'Please send a photo or video with a caption.'
      );
    });

    it('does not call handleTelegramMedia', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: YOUTUBE_URL }));

      expect(handleTelegramMedia).not.toHaveBeenCalled();
    });
  });

  describe('when an error is thrown', () => {
    it('posts an error message', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      vi.mocked(selectArtists).mockRejectedValue(new Error('db failure'));

      await invoke(thread, makeMessage());

      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('❌'));
    });

    it('includes the error message in the post', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      vi.mocked(selectArtists).mockRejectedValue(new Error('db failure'));

      await invoke(thread, makeMessage());

      expect(thread.post).toHaveBeenCalledWith(
        expect.stringContaining('db failure')
      );
    });
  });
});
