import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('./handleWelcome', () => ({ default: vi.fn() }));
vi.mock('./handleStart', () => ({ default: vi.fn() }));
vi.mock('./handleRemind', () => ({ default: vi.fn() }));
vi.mock('./handleNotify', () => ({ default: vi.fn() }));
vi.mock('../handleWelcome', () => ({ default: vi.fn() }));
vi.mock('../handleStart', () => ({ default: vi.fn() }));
vi.mock('../handleRemind', () => ({ default: vi.fn() }));
vi.mock('../handleNotify', () => ({ default: vi.fn() }));

import handleWelcome from '../handleWelcome';
import handleStart from '../handleStart';
import handleRemind from '../handleRemind';
import handleNotify from '../handleNotify';
import commandsHandler from '../commandsHandler';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ROOM_ID = 'telegram:5';
const TG_USERNAME = 'testuser';

const ARTIST = {
  address: ARTIST_ADDRESS,
  username: 'alice',
  nudge_enabled: true,
  notify_enabled: false,
} as never;

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: ROOM_ID,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(handleWelcome).mockResolvedValue(undefined);
  vi.mocked(handleStart).mockResolvedValue(undefined);
  vi.mocked(handleRemind).mockResolvedValue(undefined);
  vi.mocked(handleNotify).mockResolvedValue(undefined);
});

describe('commandsHandler', () => {
  describe('when artist is null (unregistered user)', () => {
    it('calls handleWelcome and returns true', async () => {
      const thread = makeThread();
      const result = await commandsHandler(
        'hello',
        thread as never,
        ROOM_ID,
        TG_USERNAME,
        null
      );

      expect(handleWelcome).toHaveBeenCalledWith(thread, ROOM_ID, 'hello');
      expect(result).toBe(true);
    });

    it('does not call handleStart, handleRemind, or handleNotify', async () => {
      await commandsHandler(
        '/start',
        makeThread() as never,
        ROOM_ID,
        TG_USERNAME,
        null
      );
      expect(handleStart).not.toHaveBeenCalled();
      expect(handleRemind).not.toHaveBeenCalled();
      expect(handleNotify).not.toHaveBeenCalled();
    });
  });

  describe('when artist is registered', () => {
    it('calls handleStart and returns true for /start', async () => {
      const thread = makeThread();
      const result = await commandsHandler(
        '/start',
        thread as never,
        ROOM_ID,
        TG_USERNAME,
        ARTIST
      );

      expect(handleStart).toHaveBeenCalledWith(
        thread,
        ROOM_ID,
        ARTIST_ADDRESS,
        ARTIST.username,
        TG_USERNAME
      );
      expect(result).toBe(true);
    });

    it('calls handleRemind and returns true for /remind', async () => {
      const thread = makeThread();
      const result = await commandsHandler(
        '/remind',
        thread as never,
        ROOM_ID,
        TG_USERNAME,
        ARTIST
      );

      expect(handleRemind).toHaveBeenCalledWith(
        thread,
        ROOM_ID,
        ARTIST_ADDRESS,
        ARTIST.nudge_enabled
      );
      expect(result).toBe(true);
    });

    it('calls handleNotify and returns true for /notify', async () => {
      const thread = makeThread();
      const result = await commandsHandler(
        '/notify',
        thread as never,
        ROOM_ID,
        TG_USERNAME,
        ARTIST
      );

      expect(handleNotify).toHaveBeenCalledWith(
        thread,
        ROOM_ID,
        ARTIST_ADDRESS,
        false
      );
      expect(result).toBe(true);
    });

    it('returns false for unrecognised text without calling any command handler', async () => {
      const result = await commandsHandler(
        'just some text',
        makeThread() as never,
        ROOM_ID,
        TG_USERNAME,
        ARTIST
      );

      expect(result).toBe(false);
      expect(handleStart).not.toHaveBeenCalled();
      expect(handleRemind).not.toHaveBeenCalled();
      expect(handleNotify).not.toHaveBeenCalled();
      expect(handleWelcome).not.toHaveBeenCalled();
    });
  });
});
