import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('./handleWelcome', () => ({ default: vi.fn() }));
vi.mock('./handleStart', () => ({ default: vi.fn() }));
vi.mock('./handleRemind', () => ({ default: vi.fn() }));
vi.mock('./handleNotify', () => ({ default: vi.fn() }));
vi.mock('./handleCollections', () => ({ default: vi.fn() }));
vi.mock('./handleMe', () => ({ default: vi.fn() }));
vi.mock('../handleWelcome', () => ({ default: vi.fn() }));
vi.mock('../handleStart', () => ({ default: vi.fn() }));
vi.mock('../handleRemind', () => ({ default: vi.fn() }));
vi.mock('../handleNotify', () => ({ default: vi.fn() }));
vi.mock('../handleCollections', () => ({ default: vi.fn() }));
vi.mock('../handleMe', () => ({ default: vi.fn() }));

import handleWelcome from '../handleWelcome';
import handleStart from '../handleStart';
import handleRemind from '../handleRemind';
import handleNotify from '../handleNotify';
import handleCollections from '../handleCollections';
import handleMe from '../handleMe';
import commandsHandler from '../commandsHandler';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ARTIST_UUID = 'uuid-artist-1234';
const ROOM_ID = 'telegram:5';
const TG_USERNAME = 'testuser';

const ARTIST = {
  id: ARTIST_UUID,
  username: 'alice',
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' }],
};

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: ROOM_ID,
});

const callCommandsHandler = (
  text: string,
  thread: ReturnType<typeof makeThread>,
  artist: typeof ARTIST | null,
  artistAddress?: Address
) =>
  commandsHandler(
    text,
    thread as never,
    TG_USERNAME,
    artist as never,
    artistAddress as Address
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(handleWelcome).mockResolvedValue(undefined);
  vi.mocked(handleStart).mockResolvedValue(undefined);
  vi.mocked(handleRemind).mockResolvedValue(undefined);
  vi.mocked(handleNotify).mockResolvedValue(undefined);
  vi.mocked(handleCollections).mockResolvedValue(undefined);
  vi.mocked(handleMe).mockResolvedValue(undefined);
});

describe('commandsHandler', () => {
  describe('when artist is null (unregistered user)', () => {
    it('calls handleWelcome and returns true', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler('hello', thread, null);

      expect(handleWelcome).toHaveBeenCalledWith(thread);
      expect(result).toBe(true);
    });

    it('does not call handleStart, handleRemind, handleNotify, handleCollections, or handleMe', async () => {
      await callCommandsHandler('/start', makeThread(), null);
      expect(handleStart).not.toHaveBeenCalled();
      expect(handleRemind).not.toHaveBeenCalled();
      expect(handleNotify).not.toHaveBeenCalled();
      expect(handleCollections).not.toHaveBeenCalled();
      expect(handleMe).not.toHaveBeenCalled();
    });
  });

  describe('when artist is registered', () => {
    it('calls handleStart and returns true for /start', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/start',
        thread,
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(handleStart).toHaveBeenCalledWith(
        thread,
        ARTIST.username,
        TG_USERNAME
      );
      expect(result).toBe(true);
    });

    it('calls handleRemind and returns true for /remind', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/remind',
        thread,
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(handleRemind).toHaveBeenCalledWith(thread, ARTIST_UUID);
      expect(result).toBe(true);
    });

    it('calls handleNotify and returns true for /notify', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/notify',
        thread,
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(handleNotify).toHaveBeenCalledWith(thread, ARTIST_UUID);
      expect(result).toBe(true);
    });

    it('calls handleCollections and returns true for /collections', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/collections',
        thread,
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(handleCollections).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
      expect(result).toBe(true);
    });

    it('calls handleMe and returns true for /me', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/me',
        thread,
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(handleMe).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
      expect(result).toBe(true);
    });

    it('returns false for /me when artistAddress is missing', async () => {
      const thread = makeThread();
      const result = await callCommandsHandler(
        '/me',
        thread,
        ARTIST,
        undefined
      );

      expect(result).toBe(false);
      expect(handleMe).not.toHaveBeenCalled();
    });

    it('returns false for unrecognised text without calling any command handler', async () => {
      const result = await callCommandsHandler(
        'just some text',
        makeThread(),
        ARTIST,
        ARTIST_ADDRESS
      );

      expect(result).toBe(false);
      expect(handleStart).not.toHaveBeenCalled();
      expect(handleRemind).not.toHaveBeenCalled();
      expect(handleNotify).not.toHaveBeenCalled();
      expect(handleCollections).not.toHaveBeenCalled();
      expect(handleMe).not.toHaveBeenCalled();
      expect(handleWelcome).not.toHaveBeenCalled();
    });
  });
});
