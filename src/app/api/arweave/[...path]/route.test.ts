import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createRequest = (path: string, method: string, body?: string) =>
  new NextRequest(`http://localhost/api/arweave/${path}`, {
    method,
    ...(body ? { body } : {}),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/arweave/[...path]', () => {
  it('proxies GET request to arweave.net', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const req = createRequest('tx/abc123', 'GET');
    const res = await GET(req);

    expect(mockFetch).toHaveBeenCalledWith('https://arweave.net/tx/abc123', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/json');
  });

  it('returns upstream status code on error', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      })
    );

    const req = createRequest('tx/invalid', 'GET');
    const res = await GET(req);

    expect(res.status).toBe(404);
  });

  it('defaults Content-Type to text/plain when missing', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('data', {
        status: 200,
        headers: {},
      })
    );

    const req = createRequest('some/path', 'GET');
    const res = await GET(req);

    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });
});

describe('POST /api/arweave/[...path]', () => {
  it('proxies POST request with body to arweave.net', async () => {
    const postBody = JSON.stringify({ key: 'value' });
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const req = createRequest('tx', 'POST', postBody);
    const res = await POST(req);

    expect(mockFetch).toHaveBeenCalledWith('https://arweave.net/tx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: postBody,
    });
    expect(res.status).toBe(200);
  });

  it('handles nested paths', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('ok', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    );

    const req = createRequest('a/b/c/d', 'POST', 'data');
    await POST(req);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://arweave.net/a/b/c/d',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
