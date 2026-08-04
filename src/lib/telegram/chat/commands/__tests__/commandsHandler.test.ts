import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

vi.mock('./handleStart', () => ({ default: vi.fn() }));
vi.mock('./handleRemind', () => ({ default: vi.fn() }));
vi.mock('./handleNotify', () => ({ default: vi.fn() }));
vi.mock('./handleCollections', () => ({ default: vi.fn() }));
vi.mock('./handleMe', () => ({ default: vi.fn() }));
vi.mock('./handleHelp', () => ({ default: vi.fn() }));
vi.mock('../handleStart', () => ({ default: vi.fn() }));
vi.mock('../handleRemind', () => ({ default: vi.fn() }));
vi.mock('../handleNotify', () => ({ default: vi.fn() }));
vi.mock('../handleCollections', () => ({ default: vi.fn() }));
vi.mock('../handleMe', () => ({ default: vi.fn() }));
vi.mock('../handleHelp', () => ({ default: vi.fn() }));

import handleStart from '../handleStart';
import handleRemind from '../handleRemind';
import handleNotify from '../handleNotify';
import handleCollections from '../handleCollections';
import handleMe from '../handleMe';
import handleHelp from '../handleHelp';
import commandsHandler from '../commandsHandler';

const ARTIST_ADDRESS = '0xArtist' as Address;
const ROOM_ID = 'telegram:5';
const TG_USERNAME = 'testuser';

const ARTIST = {
  artistId: 'uuid-artist-1234',
  username: 'alice',
  primaryWallet: ARTIST_ADDRESS,
  wallets: [{ address: ARTIST_ADDRESS, type: 'external' as const }],
};

const makeThread = () => ({
  post: vi.fn().mockResolvedValue(undefined),
  channelId: ROOM_ID,
});

const callCommandsHandler = (
  text: string,
  thread: ReturnType<typeof makeThread>,
  artist: typeof ARTIST = ARTIST
) => commandsHandler(text, thread as never, TG_USERNAME, artist as never);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(handleStart).mockResolvedValue(undefined);
  vi.mocked(handleRemind).mockResolvedValue(undefined);
  vi.mocked(handleNotify).mockResolvedValue(undefined);
  vi.mocked(handleCollections).mockResolvedValue(undefined);
  vi.mocked(handleMe).mockResolvedValue(undefined);
  vi.mocked(handleHelp).mockResolvedValue(undefined);
});

describe('commandsHandler', () => {
  it('calls handleStart and returns true for /start', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/start', thread);

    expect(handleStart).toHaveBeenCalledWith(
      thread,
      ARTIST.username,
      TG_USERNAME
    );
    expect(result).toBe(true);
  });

  it('calls handleRemind and returns true for /remind', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/remind', thread);

    expect(handleRemind).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
    expect(result).toBe(true);
  });

  it('calls handleNotify and returns true for /notify', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/notify', thread);

    expect(handleNotify).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
    expect(result).toBe(true);
  });

  it('calls handleCollections and returns true for /collections', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/collections', thread);

    expect(handleCollections).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
    expect(result).toBe(true);
  });

  it('calls handleMe and returns true for /me', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/me', thread);

    expect(handleMe).toHaveBeenCalledWith(thread, ARTIST_ADDRESS);
    expect(result).toBe(true);
  });

  it('calls handleHelp and returns true for /help', async () => {
    const thread = makeThread();
    const result = await callCommandsHandler('/help', thread);

    expect(handleHelp).toHaveBeenCalledWith(thread);
    expect(result).toBe(true);
  });

  it('returns false for unrecognised text without calling any command handler', async () => {
    const result = await callCommandsHandler('just some text', makeThread());

    expect(result).toBe(false);
    expect(handleStart).not.toHaveBeenCalled();
    expect(handleRemind).not.toHaveBeenCalled();
    expect(handleNotify).not.toHaveBeenCalled();
    expect(handleCollections).not.toHaveBeenCalled();
    expect(handleMe).not.toHaveBeenCalled();
    expect(handleHelp).not.toHaveBeenCalled();
  });
});
