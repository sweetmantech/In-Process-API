import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/og', () => ({
  ImageResponse: vi.fn(),
}));

vi.mock('@/lib/og/getSpectralFont', () => ({
  default: vi.fn(),
}));

import { ImageResponse } from 'next/og';
import getSpectralFont from '@/lib/og/getSpectralFont';
import generateTextPreview from '../generateTextPreview';

const mockImageResponse = vi.mocked(ImageResponse);
const mockGetSpectralFont = vi.mocked(getSpectralFont);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSpectralFont.mockResolvedValue(new ArrayBuffer(8));
  mockImageResponse.mockImplementation(function ImageResponseMock() {
    return {
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    };
  } as never);
});

describe('generateTextPreview', () => {
  it('renders with Spectral font and returns a PNG file', async () => {
    const file = await generateTextPreview('hello\nworld');

    expect(mockGetSpectralFont).toHaveBeenCalledOnce();
    expect(mockImageResponse).toHaveBeenCalledOnce();
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('text-preview.png');
    expect(file.type).toBe('image/png');
    expect(await file.arrayBuffer()).toEqual(new Uint8Array([1, 2, 3]).buffer);
  });

  it('passes OG dimensions to ImageResponse', async () => {
    await generateTextPreview('short');

    const [, options] = mockImageResponse.mock.calls[0]!;
    expect(options).toMatchObject({
      width: 500,
      height: 333,
      fonts: [{ name: 'Spectral', weight: 400 }],
    });
  });
});
