import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/fetchUri', () => ({
  default: vi.fn(),
}));

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

import fetchUri from '@/lib/arweave/fetchUri';
import getMomentPreview from '@/lib/og/getMomentPreview';

const mockFetchUri = vi.mocked(fetchUri);

const imageBuffer = new ArrayBuffer(8);

const okImageResponse = (type = 'jpg') =>
  ({
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(imageBuffer),
    headers: { get: vi.fn().mockReturnValue(`image/${type}`) },
  }) as unknown as Response;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMomentPreview', () => {
  describe('happy path', () => {
    it('returns ImageMetadata for a JPEG image as data URL', async () => {
      mockFetchUri.mockResolvedValue(okImageResponse('jpeg'));
      const { imageMeta } = await import('image-meta');
      vi.mocked(imageMeta).mockReturnValue({
        type: 'jpg',
        width: 800,
        height: 600,
        orientation: 1,
      });

      const result = await getMomentPreview('https://example.com/image.jpg');

      expect(result.orientation).toBe(1);
      expect(result.originalWidth).toBe(800);
      expect(result.originalHeight).toBe(600);
      expect(result.shouldRotate).toBe(false);
      expect(result.previewUrl).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('converts WebP to PNG data URL', async () => {
      mockFetchUri.mockResolvedValue(okImageResponse('webp'));
      const { imageMeta } = await import('image-meta');
      vi.mocked(imageMeta).mockReturnValue({
        type: 'webp',
        width: 400,
        height: 400,
        orientation: undefined,
      });

      const result = await getMomentPreview('https://example.com/image.webp');

      expect(result.previewUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('sets shouldRotate true for orientation 6', async () => {
      mockFetchUri.mockResolvedValue(okImageResponse());
      const { imageMeta } = await import('image-meta');
      vi.mocked(imageMeta).mockReturnValue({
        type: 'jpg',
        width: 600,
        height: 800,
        orientation: 6,
      });

      const result = await getMomentPreview('https://example.com/image.jpg');

      expect(result.shouldRotate).toBe(true);
    });

    it('sets shouldRotate true for orientation 8', async () => {
      mockFetchUri.mockResolvedValue(okImageResponse());
      const { imageMeta } = await import('image-meta');
      vi.mocked(imageMeta).mockReturnValue({
        type: 'jpg',
        width: 600,
        height: 800,
        orientation: 8,
      });

      const result = await getMomentPreview('https://example.com/image.jpg');

      expect(result.shouldRotate).toBe(true);
    });

    it('falls back to defaults when image-meta returns no dimensions', async () => {
      mockFetchUri.mockResolvedValue(okImageResponse());
      const { imageMeta } = await import('image-meta');
      vi.mocked(imageMeta).mockReturnValue({
        type: 'jpg',
        width: undefined,
        height: undefined,
        orientation: undefined,
      });

      const result = await getMomentPreview('https://example.com/image.jpg');

      expect(result.orientation).toBe(1);
      expect(result.originalWidth).toBe(0);
      expect(result.originalHeight).toBe(1);
    });
  });
});
