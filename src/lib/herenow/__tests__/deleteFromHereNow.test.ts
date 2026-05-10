import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import deleteFromHereNow from '@/lib/herenow/deleteFromHereNow';

const API_KEY = 'test-api-key';

describe('deleteFromHereNow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('HERENOW_API_KEY', API_KEY);
    fetchMock.mockResolvedValue({ ok: true });
  });

  it('calls DELETE for a subdomain here.now URL', async () => {
    await deleteFromHereNow('https://my-slug.here.now/file.png');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://here.now/api/v1/publish/my-slug',
      expect.objectContaining({
        method: 'DELETE',
        headers: { Authorization: `Bearer ${API_KEY}` },
      })
    );
  });

  it('calls DELETE for a path-based here.now URL', async () => {
    await deleteFromHereNow('https://here.now/my-slug/file.png');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://here.now/api/v1/publish/my-slug',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('does nothing for a non-here.now URL', async () => {
    await deleteFromHereNow('https://example.com/file.png');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not throw when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('network error'));

    await expect(
      deleteFromHereNow('https://my-slug.here.now/file.png')
    ).resolves.toBeUndefined();
  });
});
