import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/og/getArchivoFont', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/og/getSpectralFont', () => ({
  default: vi.fn(),
}));

import getArchivoFont from '@/lib/og/getArchivoFont';
import getSpectralFont from '@/lib/og/getSpectralFont';
import getOgFonts from '@/lib/og/getOgFonts';

const mockArchivo = vi.mocked(getArchivoFont);
const mockSpectral = vi.mocked(getSpectralFont);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getOgFonts', () => {
  it('loads Archivo and Spectral in parallel and returns both buffers', async () => {
    const archivoBuf = new ArrayBuffer(3);
    const spectralBuf = new ArrayBuffer(5);
    mockArchivo.mockResolvedValue(archivoBuf);
    mockSpectral.mockResolvedValue(spectralBuf);

    const result = await getOgFonts();

    expect(result.archivo).toBe(archivoBuf);
    expect(result.spectral).toBe(spectralBuf);
    expect(mockArchivo).toHaveBeenCalledTimes(1);
    expect(mockSpectral).toHaveBeenCalledTimes(1);
  });
});
