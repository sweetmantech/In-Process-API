import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/moment/getMomentMime', () => ({
  default: vi.fn(),
}));

vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: vi.fn() },
}));

import getMomentMime from '@/lib/moment/getMomentMime';
import { tasks } from '@trigger.dev/sdk';
import triggerMuxMigration from '@/lib/moment/triggerMuxMigration';

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

  it('triggers migrate-mux-to-arweave for video mime type', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('video/mp4');

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).toHaveBeenCalledWith('migrate-mux-to-arweave', {
      collectionAddress: COLLECTION,
      tokenId: '7',
      chainId: 8453,
      artistAddress: ARTIST,
    });
  });

  it('does not trigger for image mime type', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('image/jpeg');

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger for a mime type that contains "video" but is not video/*', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('application/x-video-codec');

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('does not trigger when getMomentMime returns null', async () => {
    vi.mocked(getMomentMime).mockResolvedValue(null);

    await triggerMuxMigration(baseInput);

    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it('calls getMomentMime with the provided uri', async () => {
    vi.mocked(getMomentMime).mockResolvedValue(null);

    await triggerMuxMigration({
      ...baseInput,
      uri: 'https://example.com/meta.json',
    });

    expect(getMomentMime).toHaveBeenCalledWith('https://example.com/meta.json');
  });

  it('propagates errors from tasks.trigger', async () => {
    vi.mocked(getMomentMime).mockResolvedValue('video/mp4');
    vi.mocked(tasks.trigger).mockRejectedValue(
      new Error('Trigger.dev unavailable')
    );

    await expect(triggerMuxMigration(baseInput)).rejects.toThrow(
      'Trigger.dev unavailable'
    );
  });

  it('propagates errors from getMomentMime', async () => {
    vi.mocked(getMomentMime).mockRejectedValue(new Error('Fetch failed'));

    await expect(triggerMuxMigration(baseInput)).rejects.toThrow(
      'Fetch failed'
    );
  });
});
