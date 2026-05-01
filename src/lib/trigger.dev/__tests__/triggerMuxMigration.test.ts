import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/metadata/getMetadataHandler', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/protocolSdk/retries', () => ({
  retriesGeneric: vi.fn(({ tryFn }: { tryFn: () => unknown }) =>
    Promise.resolve(tryFn())
  ),
}));

vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: vi.fn() },
}));

import getMetadataHandler from '@/lib/metadata/getMetadataHandler';
import { tasks } from '@trigger.dev/sdk';
import { CHAIN_ID } from '@/lib/consts';
import triggerMuxMigration from '@/lib/trigger.dev/triggerMuxMigration';

const COLLECTION = '0x1111111111111111111111111111111111111111' as const;
const ARTIST = '0x2222222222222222222222222222222222222222' as const;

const baseInput = {
  uri: 'ar://metadata-hash',
  collectionAddress: COLLECTION,
  tokenId: '7',
  artistAddress: ARTIST,
};

describe('triggerMuxMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers migrate-mux-to-arweave when content uri points at Mux', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 't',
      content: {
        mime: 'video/mp4',
        uri: 'https://stream.mux.com/playback-id.m3u8',
      },
    });

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).toHaveBeenCalledWith('migrate-mux-to-arweave', {
      collectionAddress: COLLECTION,
      tokenId: '7',
      chainId: CHAIN_ID,
      artistAddress: ARTIST,
    });
  });

  it('does not trigger when content uri is not mux.com', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 't',
      content: { mime: 'video/mp4', uri: 'https://example.com/foo.mp4' },
    });

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger when mux.com appears elsewhere but not in content uri', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 'https://mux.com/not-the-content-uri',
      content: {
        mime: 'video/mp4',
        uri: 'https://example.com/video.mp4',
      },
    });

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger when metadata has no content', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 't',
      image: 'https://example.com/img.png',
    });

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('calls getMetadataHandler with the provided uri', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 't',
    });

    await triggerMuxMigration({
      ...baseInput,
      uri: 'https://example.com/meta.json',
    });

    expect(getMetadataHandler).toHaveBeenCalledWith({
      uri: 'https://example.com/meta.json',
    });
  });

  it('does not throw when tasks.trigger fails', async () => {
    vi.mocked(getMetadataHandler).mockResolvedValue({
      name: 't',
      content: { mime: 'video/mp4', uri: 'https://mux.com/x' },
    });
    vi.mocked(tasks.trigger).mockRejectedValue(
      new Error('Trigger.dev unavailable')
    );

    await expect(triggerMuxMigration(baseInput)).resolves.not.toThrow();
  });

  it('propagates errors from getMetadataHandler', async () => {
    vi.mocked(getMetadataHandler).mockRejectedValue(new Error('Fetch failed'));

    await expect(triggerMuxMigration(baseInput)).rejects.toThrow(
      'Fetch failed'
    );
  });
});
