import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';
import { registerOnNewMention } from '../onNewMention';

vi.mock('@/lib/supabase/in_process_artists/selectArtists', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_rooms/upsertRoom', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/in_process_artists/upsertProfile', () => ({
  upsertProfile: vi.fn(),
}));
vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));
vi.mock('../../processMediaThread', () => ({ default: vi.fn() }));
vi.mock('../../createMomentFromYoutubeLink', () => ({ default: vi.fn() }));
vi.mock('../../replyAfterSuccess', () => ({ default: vi.fn() }));

import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import upsertRoom from '@/lib/supabase/in_process_rooms/upsertRoom';
import { upsertProfile } from '@/lib/supabase/in_process_artists/upsertProfile';
import { logMessage } from '@/lib/messages/logMessage';
import processMediaThread from '../../processMediaThread';
import createMomentFromYoutubeLink from '../../createMomentFromYoutubeLink';
import replyAfterSuccess from '../../replyAfterSuccess';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST = {
  address: ARTIST_ADDRESS,
  username: 'alice',
  nudge_enabled: true,
};
const CHANNEL_ID = 'chat-telegram';

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  startTyping: vi.fn().mockResolvedValue(undefined),
  channelId: CHANNEL_ID,
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
  vi.mocked(upsertRoom).mockResolvedValue(undefined as never);
  vi.mocked(upsertProfile).mockResolvedValue({ error: null } as never);
  vi.mocked(createMomentFromYoutubeLink).mockResolvedValue(
    MOMENT_RESULT as never
  );
  vi.mocked(replyAfterSuccess).mockResolvedValue(undefined);
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
        CHANNEL_ID,
        undefined,
        'telegram'
      );
      expect(logMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'assistant',
        CHANNEL_ID,
        undefined,
        'telegram'
      );
    });

    it('does not call processMediaThread', async () => {
      const { invoke } = setup();
      await invoke(makeThread(), makeMessage({ text: 'hello' }));
      expect(processMediaThread).not.toHaveBeenCalled();
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
        CHANNEL_ID,
        ARTIST_ADDRESS,
        'telegram'
      );
    });

    it('does not call processMediaThread', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: '/start' }));

      expect(processMediaThread).not.toHaveBeenCalled();
    });
  });

  describe('when a linked artist sends /remind', () => {
    it('toggles nudge_enabled off and posts confirmation', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: '/remind' }));

      expect(upsertProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          address: ARTIST_ADDRESS,
          nudge_enabled: false,
        })
      );
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔕'));
    });

    it('toggles nudge_enabled on when currently false', async () => {
      vi.mocked(selectArtists).mockResolvedValue({
        data: [{ ...ARTIST, nudge_enabled: false }],
        error: null,
      } as never);
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: '/remind' }));

      expect(upsertProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          address: ARTIST_ADDRESS,
          nudge_enabled: true,
        })
      );
      expect(thread.post).toHaveBeenCalledWith(expect.stringContaining('🔔'));
    });

    it('logs the remind response as assistant', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: '/remind' }));

      expect(logMessage).toHaveBeenCalledWith(
        expect.any(Array),
        'assistant',
        CHANNEL_ID,
        ARTIST_ADDRESS,
        'telegram'
      );
    });

    it('does not call processMediaThread', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: '/remind' }));

      expect(processMediaThread).not.toHaveBeenCalled();
    });
  });

  describe('when a linked artist sends an image', () => {
    it('delegates to processMediaThread', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      const attachment = { type: 'image', size: 500 };
      const message = makeMessage({ attachments: [attachment] });

      await invoke(thread, message);

      expect(processMediaThread).toHaveBeenCalledWith(
        thread,
        message,
        attachment,
        '',
        ARTIST_ADDRESS
      );
    });
  });

  describe('when a linked artist sends a video', () => {
    it('delegates to processMediaThread', async () => {
      const { invoke } = setup();
      const thread = makeThread();
      const attachment = { type: 'video', size: 2000 };
      const message = makeMessage({ attachments: [attachment] });

      await invoke(thread, message);

      expect(processMediaThread).toHaveBeenCalledWith(
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
      expect(processMediaThread).not.toHaveBeenCalled();
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
        ARTIST_ADDRESS,
        CHANNEL_ID
      );
    });

    it('calls replyAfterSuccess with the created moment details', async () => {
      const { invoke } = setup();
      const thread = makeThread();

      await invoke(thread, makeMessage({ text: YOUTUBE_URL }));

      expect(replyAfterSuccess).toHaveBeenCalledWith(
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

    it('does not call processMediaThread', async () => {
      const { invoke } = setup();

      await invoke(makeThread(), makeMessage({ text: YOUTUBE_URL }));

      expect(processMediaThread).not.toHaveBeenCalled();
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
