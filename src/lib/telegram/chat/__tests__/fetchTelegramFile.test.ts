import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import fetchTelegramFile from '../fetchTelegramFile';

vi.mock('../getTelegramFilePath', () => ({ default: vi.fn() }));

import getTelegramFilePath from '../getTelegramFilePath';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TELEGRAM_CHAT_BOT_TOKEN = 'test-token';
  vi.mocked(getTelegramFilePath).mockResolvedValue('photos/file.jpg');
  global.fetch = vi.fn();
});

describe('fetchTelegramFile', () => {
  it('returns a Buffer and mimeType on success', async () => {
    const data = Buffer.from('image data');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () =>
        Promise.resolve(
          data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
        ),
    } as never);

    const result = await fetchTelegramFile('file-id');

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('derives mimeType from the file path extension', async () => {
    vi.mocked(getTelegramFilePath).mockResolvedValue('videos/clip.mp4');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    } as never);

    const result = await fetchTelegramFile('file-id');

    expect(result.mimeType).toBe('video/mp4');
  });

  it('sniffs HEIC mimeType from magic bytes when the Telegram path has no extension', async () => {
    const buffer = readFileSync(
      join(__dirname, 'fixtures', 'apple-styled-photo.heic')
    );
    vi.mocked(getTelegramFilePath).mockResolvedValue('documents/111');
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () =>
        Promise.resolve(
          buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          )
        ),
    } as never);

    const result = await fetchTelegramFile('file-id');

    expect(result.mimeType).toBe('image/heic');
  });

  it('throws when the Telegram file response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as never);

    await expect(fetchTelegramFile('bad-id')).rejects.toThrow(
      'Failed to fetch Telegram file: Not Found'
    );
  });

  it('resolves the file path via getTelegramFilePath', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    } as never);

    await fetchTelegramFile('some-id');

    expect(getTelegramFilePath).toHaveBeenCalledWith('some-id');
  });
});
