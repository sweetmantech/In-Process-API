import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import uploadHandler from '@/lib/herenow/uploadHandler';

const API_KEY = 'test-api-key';
const HERENOW_RESPONSE = {
  slug: 'abc123',
  upload: {
    versionId: 'v1',
    uploads: [
      {
        url: 'https://upload.here.now/presigned',
        headers: { 'x-amz-acl': 'private' },
      },
    ],
  },
};

const makeOkFetch = (body: object) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) });

const makeFailFetch = (body: object) =>
  Promise.resolve({ ok: false, json: () => Promise.resolve(body) });

describe('uploadHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('HERENOW_API_KEY', API_KEY);
    fetchMock.mockImplementation(() => makeOkFetch(HERENOW_RESPONSE));
  });

  it('calls here.now publish API with correct payload', async () => {
    await uploadHandler('file.png', 1024, 'image/png', 'deadbeef');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://here.now/api/v1/publish',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${API_KEY}`,
        }),
        body: JSON.stringify({
          files: [
            {
              path: 'file.png',
              size: 1024,
              contentType: 'image/png',
              hash: 'deadbeef',
            },
          ],
          ttlSeconds: 3600,
        }),
      })
    );
  });

  it('returns presigned URL and metadata on success', async () => {
    const res = await uploadHandler('file.png', 1024, 'image/png', 'deadbeef');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      uploadUrl: 'https://upload.here.now/presigned',
      uploadHeaders: { 'x-amz-acl': 'private' },
      slug: 'abc123',
      versionId: 'v1',
      filePath: 'file.png',
    });
  });

  it('returns 500 with here.now error message when publish fails', async () => {
    fetchMock.mockImplementation(() =>
      makeFailFetch({ message: 'quota exceeded' })
    );

    const res = await uploadHandler('file.png', 1024, 'image/png', 'deadbeef');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe('quota exceeded');
  });

  it('returns generic 500 message when here.now error has no message', async () => {
    fetchMock.mockImplementation(() => makeFailFetch({}));

    const res = await uploadHandler('file.png', 1024, 'image/png', 'deadbeef');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe('Failed to create upload session');
  });
});
