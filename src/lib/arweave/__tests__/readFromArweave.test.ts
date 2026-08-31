import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/wayfinderClient', () => ({
  default: { request: vi.fn() },
}));
vi.mock('@/lib/arweave/buildArweaveGatewayUrls', () => ({
  default: vi.fn(() => ['https://turbo-gateway.com/abc123']),
}));

import wayfinderClient from '@/lib/arweave/wayfinderClient';
import buildArweaveGatewayUrls from '@/lib/arweave/buildArweaveGatewayUrls';
import readFromArweave from '@/lib/arweave/readFromArweave';

describe('readFromArweave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('returns the first successful Wayfinder response', async () => {
    vi.mocked(wayfinderClient.request).mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const response = await readFromArweave('ar://abc123');

    expect(response.status).toBe(200);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('falls back through gateway URLs when Wayfinder fails', async () => {
    vi.mocked(wayfinderClient.request).mockRejectedValue(new Error('wayfinder down'));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const response = await readFromArweave('ar://abc123');

    expect(buildArweaveGatewayUrls).toHaveBeenCalledWith('abc123');
    expect(fetch).toHaveBeenCalledWith(
      'https://turbo-gateway.com/abc123',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    expect(response.status).toBe(200);
  });
});
