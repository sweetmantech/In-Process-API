import { describe, it, expect, vi, beforeEach } from 'vitest';
import getMomentImageData from '@/lib/og/getMomentImageData';

vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('png-data')),
  }));
  return { default: mockSharp };
});

vi.mock('image-meta', () => ({
  imageMeta: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

const mockFetchOk = (type = 'jpg') => {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    headers: { get: vi.fn().mockReturnValue(`image/${type}`) },
  } as unknown as Response);
};

describe('getMomentImageData', () => {
  it('throws if fetch response is not ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
    } as Response);

    await expect(
      getMomentImageData('https://example.com/image.jpg')
    ).rejects.toThrow('failed to get image metadata');
  });

  it('returns ImageMetadata for a JPEG image as data URL', async () => {
    mockFetchOk('jpeg');
    const { imageMeta } = await import('image-meta');
    vi.mocked(imageMeta).mockReturnValue({
      type: 'jpg',
      width: 800,
      height: 600,
      orientation: 1,
    });

    const result = await getMomentImageData('https://example.com/image.jpg');

    expect(result.orientation).toBe(1);
    expect(result.originalWidth).toBe(800);
    expect(result.originalHeight).toBe(600);
    expect(result.shouldRotate).toBe(false);
    expect(result.previewUrl).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('converts WebP to PNG data URL', async () => {
    mockFetchOk('webp');
    const { imageMeta } = await import('image-meta');
    vi.mocked(imageMeta).mockReturnValue({
      type: 'webp',
      width: 400,
      height: 400,
      orientation: undefined,
    });

    const result = await getMomentImageData('https://example.com/image.webp');

    expect(result.previewUrl).toMatch(/^data:image\/png;base64,/);
  });

  it('sets shouldRotate true for orientation 6', async () => {
    mockFetchOk();
    const { imageMeta } = await import('image-meta');
    vi.mocked(imageMeta).mockReturnValue({
      type: 'jpg',
      width: 600,
      height: 800,
      orientation: 6,
    });

    const result = await getMomentImageData('https://example.com/image.jpg');

    expect(result.shouldRotate).toBe(true);
  });

  it('sets shouldRotate true for orientation 8', async () => {
    mockFetchOk();
    const { imageMeta } = await import('image-meta');
    vi.mocked(imageMeta).mockReturnValue({
      type: 'jpg',
      width: 600,
      height: 800,
      orientation: 8,
    });

    const result = await getMomentImageData('https://example.com/image.jpg');

    expect(result.shouldRotate).toBe(true);
  });

  it('falls back to defaults when image-meta returns no dimensions', async () => {
    mockFetchOk();
    const { imageMeta } = await import('image-meta');
    vi.mocked(imageMeta).mockReturnValue({
      type: 'jpg',
      width: undefined,
      height: undefined,
      orientation: undefined,
    });

    const result = await getMomentImageData('https://example.com/image.jpg');

    expect(result.orientation).toBe(1);
    expect(result.originalWidth).toBe(0);
    expect(result.originalHeight).toBe(1);
  });
});
