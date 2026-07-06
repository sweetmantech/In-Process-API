import { describe, it, expect, vi, beforeEach } from 'vitest';
import upsertMomentMetadataFromUri from '../upsertMomentMetadataFromUri';

vi.mock('@/lib/supabase/in_process_metadata/upsertMetadata', () => ({
  upsertMetadata: vi.fn(),
}));
vi.mock('@/lib/metadata/getMetadataHandler', () => ({
  default: vi.fn(),
}));

import { upsertMetadata } from '@/lib/supabase/in_process_metadata/upsertMetadata';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';

const MOMENT_ID = 'moment-uuid';
const URI = 'ar://token-meta';

const MOCK_METADATA = {
  name: 'Test Moment',
  description: 'A test',
  image: 'ar://image',
  animation_url: null,
  external_url: null,
  content: { mime: 'image/jpeg', uri: 'ar://image' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMetadataHandler).mockResolvedValue(MOCK_METADATA as never);
  vi.mocked(upsertMetadata).mockResolvedValue(undefined);
});

describe('upsertMomentMetadataFromUri', () => {
  it('fetches and upserts metadata for the moment', async () => {
    await upsertMomentMetadataFromUri(MOMENT_ID, URI);

    expect(getMetadataHandler).toHaveBeenCalledWith({ uri: URI });
    expect(upsertMetadata).toHaveBeenCalledWith([
      {
        moment: MOMENT_ID,
        name: MOCK_METADATA.name,
        description: MOCK_METADATA.description,
        image: MOCK_METADATA.image,
        animation_url: null,
        external_url: null,
        content: MOCK_METADATA.content,
      },
    ]);
  });

  it('logs error but does not throw when getMetadataHandler fails', async () => {
    vi.mocked(getMetadataHandler).mockRejectedValue(new Error('fetch failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      upsertMomentMetadataFromUri(MOMENT_ID, URI)
    ).resolves.toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[upsertMomentMetadataFromUri] failed to upsert metadata:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
