import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/artists/ensureArtists', () => ({
  ensureArtists: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collections/selectCollections', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_moments/selectMoments', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_collections/upsertCollections', () => ({
  upsertCollections: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_moments/upsertMoments', () => ({
  upsertMoments: vi.fn(),
}));

vi.mock('@/lib/supabase/in_process_message_moment/upsertMessageMoment', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/messages/logMessage', () => ({ logMessage: vi.fn() }));
vi.mock('@/lib/moment/getMomentSuccessMessage', () => ({
  default: vi
    .fn()
    .mockReturnValue(
      'Moment created, ready for editing at https://inprocess.world/sms/base:0x1111111111111111111111111111111111111111/7'
    ),
}));

import { ensureArtists } from '@/lib/artists/ensureArtists';
import selectCollections from '@/lib/supabase/in_process_collections/selectCollections';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import { upsertCollections } from '@/lib/supabase/in_process_collections/upsertCollections';
import { upsertMoments } from '@/lib/supabase/in_process_moments/upsertMoments';
import upsertMessageMoment from '@/lib/supabase/in_process_message_moment/upsertMessageMoment';
import { logMessage } from '@/lib/messages/logMessage';
import indexMessageMoment from '@/lib/moment/indexMessageMoment';

const CONTRACT = '0x1111111111111111111111111111111111111111' as const;
const ARTIST = '0x2222222222222222222222222222222222222222' as const;

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(ensureArtists).mockResolvedValue(undefined);

  vi.mocked(selectCollections).mockResolvedValue({
    data: [],
    count: 0,
    error: null,
  });
  vi.mocked(selectMoments).mockResolvedValue({
    data: [],
    error: null,
  });

  vi.mocked(upsertCollections).mockResolvedValue([{ id: 'from-upsert' }]);
  vi.mocked(upsertMoments).mockResolvedValue([
    {
      id: 'moment-uuid-1',
      uri: '',
      token_id: 7,
      collection: {
        address: CONTRACT,
        creator: ARTIST,
      },
    },
  ]);

  vi.mocked(logMessage).mockResolvedValue('msg-id-123');
  vi.mocked(upsertMessageMoment).mockResolvedValue({ data: {}, error: null });
});

describe('indexMessageMoment', () => {
  const basePayload = () => ({
    contractAddress: CONTRACT,
    tokenId: '7',
    artistAddress: ARTIST,
    channel: 'web' as const,
    chatId: undefined as string | undefined,
    contract: { address: CONTRACT, name: undefined, uri: undefined },
    token: { tokenMetadataURI: 'ar://meta' },
  });

  it('selects collection with limit 1; upserts when absent; omits name and uri unless contract supplies them', async () => {
    await indexMessageMoment(basePayload());

    expect(selectCollections).toHaveBeenCalledWith({
      collections: [
        { address: CONTRACT.toLowerCase(), chainId: expect.any(Number) },
      ],
      limit: 1,
    });
    expect(upsertCollections).toHaveBeenCalledTimes(1);
    const upsertPayload = vi.mocked(upsertCollections).mock.calls[0]?.[0]?.[0];
    expect(upsertPayload).not.toHaveProperty('name');
    expect(upsertPayload).not.toHaveProperty('uri');

    expect(vi.mocked(upsertMoments).mock.calls[0][0][0]?.collection).toBe(
      'from-upsert'
    );
  });

  it('skips collection upsert when selectCollections returns a row', async () => {
    vi.mocked(selectCollections).mockResolvedValue({
      data: [{ id: 'existing-collection-id' } as any],
      count: 1,
      error: null,
    });

    await indexMessageMoment(basePayload());

    expect(upsertCollections).not.toHaveBeenCalled();
    expect(vi.mocked(upsertMoments).mock.calls[0][0][0]?.collection).toBe(
      'existing-collection-id'
    );
  });

  it('skips moment upsert when selectMoments returns a row', async () => {
    vi.mocked(selectMoments).mockResolvedValue({
      data: [{ id: 'existing-moment-id' } as any],
      error: null,
    });

    await indexMessageMoment(basePayload());

    expect(upsertMoments).not.toHaveBeenCalled();
    expect(upsertMessageMoment).toHaveBeenCalledWith({
      message: 'msg-id-123',
      moment: 'existing-moment-id',
    });
  });

  it('merges ...(contract.name) and ...(contract.uri) onto the upsert payload', async () => {
    await indexMessageMoment({
      ...basePayload(),
      contract: { address: CONTRACT, name: 'My Col', uri: 'ipfs://meta' },
    });

    expect(upsertCollections).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'My Col',
        uri: 'ipfs://meta',
      }),
    ]);
  });

  it('writes moments with epoch placeholder timestamps for Envio to supersede', async () => {
    await indexMessageMoment(basePayload());

    expect(vi.mocked(upsertMoments).mock.calls[0][0][0]).toMatchObject({
      created_at: '1970-01-01T00:00:00.000Z',
      updated_at: '1970-01-01T00:00:00.000Z',
    });
  });

  it('calls logMessage with channel params', async () => {
    await indexMessageMoment({
      ...basePayload(),
      channel: 'telegram',
      chatId: 'chat-42',
    });

    expect(logMessage).toHaveBeenCalledWith(
      [
        {
          type: 'text',
          text: 'Moment created, ready for editing at https://inprocess.world/sms/base:0x1111111111111111111111111111111111111111/7',
        },
      ],
      'assistant',
      'chat-42',
      ARTIST.toLowerCase(),
      'telegram'
    );
  });

  it('calls selectMoments with limit 1 and chainId', async () => {
    await indexMessageMoment(basePayload());

    expect(selectMoments).toHaveBeenCalledWith({
      moments: [
        {
          collectionAddress: CONTRACT.toLowerCase(),
          tokenId: '7',
          chainId: expect.any(Number),
        },
      ],
      chainId: expect.any(Number),
      limit: 1,
    });
  });

  it('indexes message ↔ moment ids when messageId exists', async () => {
    await indexMessageMoment(basePayload());

    expect(upsertMessageMoment).toHaveBeenCalledWith({
      message: 'msg-id-123',
      moment: 'moment-uuid-1',
    });
  });

  it('does not upsert message_moment row when logMessage returns no messageId', async () => {
    vi.mocked(logMessage).mockResolvedValue(null);

    await indexMessageMoment(basePayload());

    expect(upsertMessageMoment).not.toHaveBeenCalled();
  });

  it('throws when upsertCollections returns no ids', async () => {
    vi.mocked(upsertCollections).mockResolvedValue([]);

    await expect(indexMessageMoment(basePayload())).rejects.toThrow(
      /upsertCollections did not return an id/
    );
  });

  it('throws when upsertMoments returns no ids', async () => {
    vi.mocked(upsertMoments).mockResolvedValue([]);

    await expect(indexMessageMoment(basePayload())).rejects.toThrow(
      /upsertMoments did not return an id/
    );
  });

  it('propagates failure from upsertMessageMoment after logMessage', async () => {
    vi.mocked(upsertMessageMoment).mockResolvedValue({
      data: null,
      error: new Error('link failed'),
    });

    await expect(indexMessageMoment(basePayload())).rejects.toThrow(
      /link failed/
    );
  });
});
