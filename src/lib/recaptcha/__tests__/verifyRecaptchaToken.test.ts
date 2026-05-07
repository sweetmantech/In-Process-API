import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import verifyRecaptchaToken from '@/lib/recaptcha/verifyRecaptchaToken';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockResponse = (success: boolean, ok = true) =>
  ({ ok, json: vi.fn().mockResolvedValue({ success }) }) as any;

describe('verifyRecaptchaToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
  });

  afterEach(() => {
    delete process.env.RECAPTCHA_SECRET_KEY;
  });

  it('returns false when RECAPTCHA_SECRET_KEY is not set', async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;

    const result = await verifyRecaptchaToken('any-token');

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns true when Google responds with success: true', async () => {
    mockFetch.mockResolvedValue(mockResponse(true));

    const result = await verifyRecaptchaToken('valid-token');

    expect(result).toBe(true);
  });

  it('returns false when Google responds with success: false', async () => {
    mockFetch.mockResolvedValue(mockResponse(false));

    const result = await verifyRecaptchaToken('invalid-token');

    expect(result).toBe(false);
  });

  it('calls Google verify URL with correct method and headers', async () => {
    mockFetch.mockResolvedValue(mockResponse(true));

    await verifyRecaptchaToken('my-token');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.google.com/recaptcha/api/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('returns false when response is not ok', async () => {
    mockFetch.mockResolvedValue(mockResponse(true, false));

    const result = await verifyRecaptchaToken('token');

    expect(result).toBe(false);
  });

  it('returns false on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const result = await verifyRecaptchaToken('token');

    expect(result).toBe(false);
  });

  it('sends secret and token in the request body', async () => {
    mockFetch.mockResolvedValue(mockResponse(true));

    await verifyRecaptchaToken('my-token');

    const body: URLSearchParams = mockFetch.mock.calls[0][1].body;
    expect(body.get('secret')).toBe('test-secret');
    expect(body.get('response')).toBe('my-token');
  });
});
