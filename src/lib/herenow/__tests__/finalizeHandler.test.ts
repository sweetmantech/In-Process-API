import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import finalizeHandler from '@/lib/herenow/finalizeHandler';

const API_KEY = 'test-api-key';
const SITE_URL = 'https://abc123.here.now';

const makeOkFetch = (body: object) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

const makeFailFetch = (body: object) =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(body) });

describe('finalizeHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('HERENOW_API_KEY', API_KEY);
    fetchMock.mockImplementation(() => makeOkFetch({ siteUrl: SITE_URL }));
  });

  it('calls here.now finalize API with correct slug and versionId', async () => {
    await finalizeHandler('abc123', 'v1');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://here.now/api/v1/publish/abc123/finalize',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${API_KEY}`,
        }),
        body: JSON.stringify({ versionId: 'v1' }),
      })
    );
  });

  it('returns siteUrl directly when filePath is not provided', async () => {
    const res = await finalizeHandler('abc123', 'v1');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe(SITE_URL);
  });

  it('returns siteUrl with filePath appended when filePath is provided', async () => {
    const res = await finalizeHandler('abc123', 'v1', 'image.png');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe(`${SITE_URL}/image.png`);
  });

  it('returns 500 with here.now error message when finalize fails', async () => {
    fetchMock.mockImplementation(() =>
      makeFailFetch({ message: 'version not found' })
    );

    const res = await finalizeHandler('abc123', 'v1');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe('version not found');
  });

  it('returns generic 500 message when here.now error has no message', async () => {
    fetchMock.mockImplementation(() => makeFailFetch({}));

    const res = await finalizeHandler('abc123', 'v1');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe('Failed to finalize upload');
  });
});
