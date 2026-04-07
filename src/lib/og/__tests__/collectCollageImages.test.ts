import { describe, it, expect, vi, beforeEach } from 'vitest';
import collectCollageImages from '@/lib/og/collectCollageImages';

vi.mock('@/lib/og/getCollageImageData');
import getCollageImageData from '@/lib/og/getCollageImageData';

const input = (imageUrl: string, createdAt: string) => ({
  imageUrl,
  createdAt,
});
const dataUrl = (n: number) => `data:image/jpeg;base64,img${n}`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('collectCollageImages', () => {
  it('returns empty array when inputs is empty', async () => {
    const result = await collectCollageImages([]);
    expect(result).toEqual([]);
  });

  it('returns entries with url and createdAt', async () => {
    vi.mocked(getCollageImageData).mockResolvedValue(dataUrl(0));

    const result = await collectCollageImages([
      input('ar://abc', '2024-01-15T00:00:00Z'),
    ]);

    expect(result).toEqual([
      { url: dataUrl(0), createdAt: '2024-01-15T00:00:00Z' },
    ]);
  });

  it('skips inputs where getCollageImageData returns null', async () => {
    vi.mocked(getCollageImageData)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(dataUrl(1));

    const result = await collectCollageImages([
      input('ar://fail', '2024-01-01T00:00:00Z'),
      input('ar://ok', '2024-01-02T00:00:00Z'),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].url).toBe(dataUrl(1));
    expect(result[0].createdAt).toBe('2024-01-02T00:00:00Z');
  });

  it('sorts results oldest-first (highest index = oldest in newest-first input)', async () => {
    // inputs are newest-first: index 0 = newest, index 2 = oldest
    vi.mocked(getCollageImageData).mockImplementation(
      async (url) => url as string
    );

    const inputs = [
      input('newest', '2024-03-01T00:00:00Z'),
      input('middle', '2024-02-01T00:00:00Z'),
      input('oldest', '2024-01-01T00:00:00Z'),
    ];

    const result = await collectCollageImages(inputs);

    expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result[1].createdAt).toBe('2024-02-01T00:00:00Z');
    expect(result[2].createdAt).toBe('2024-03-01T00:00:00Z');
  });
});
