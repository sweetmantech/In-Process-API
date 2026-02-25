import { describe, it, expect, vi, beforeEach } from 'vitest';
import getWritingData from '@/lib/og/getWritingData';

vi.mock('@/lib/protocolSdk/ipfs/gateway', () => ({
  getFetchableUrl: vi.fn(),
}));

const mockFetch = (text: string) => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(text),
  } as Response);
};

beforeEach(async () => {
  vi.clearAllMocks();
  const { getFetchableUrl } = await import('@/lib/protocolSdk/ipfs/gateway');
  vi.mocked(getFetchableUrl).mockResolvedValue(
    'https://cdn.example.com/content'
  );
});

describe('getWritingData', () => {
  it('throws if getFetchableUrl returns null', async () => {
    const { getFetchableUrl } = await import('@/lib/protocolSdk/ipfs/gateway');
    vi.mocked(getFetchableUrl).mockResolvedValue(null);

    await expect(getWritingData('ipfs://some-uri')).rejects.toThrow(
      'failed to convert content uri to fetchable url'
    );
  });

  it('returns writingText and totalLines for a single short line', async () => {
    mockFetch('Hello');

    const { writingText, totalLines } = await getWritingData('ipfs://some-uri');

    expect(writingText).toBe('Hello');
    // "Hello" (5 chars): 5/64 rounds to 0, +1 = 1 line
    expect(totalLines).toBe(1);
  });

  it('counts each newline-separated paragraph as at least 1 line', async () => {
    mockFetch('Hello\nWorld');

    const { writingText, totalLines } = await getWritingData('ipfs://some-uri');

    expect(writingText).toBe('Hello\nWorld');
    expect(totalLines).toBe(2);
  });

  it('adds extra lines for paragraphs longer than 64 characters', async () => {
    mockFetch('a'.repeat(128));

    const { totalLines } = await getWritingData('ipfs://some-uri');

    // 128 / 64 = 2, +1 = 3
    expect(totalLines).toBe(3);
  });

  it('counts empty lines as 1 line each', async () => {
    mockFetch('\n\n');

    const { totalLines } = await getWritingData('ipfs://some-uri');

    // 3 paragraphs ("", "", ""), each 0 chars → 1 line each
    expect(totalLines).toBe(3);
  });
});
