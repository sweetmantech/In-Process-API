import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';

beforeEach(() => {
  process.env.TELEGRAM_CHAT_BOT_TOKEN = 'test-token';
  global.fetch = vi.fn();
});

afterEach(() => {
  delete process.env.TELEGRAM_CHAT_BOT_TOKEN;
});

const mockOkJson = (data: unknown) =>
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  } as never);

describe('getTelegramFilePath', () => {
  it('returns file_path from the Telegram API response', async () => {
    mockOkJson({ result: { file_path: 'photos/abc.jpg' } });

    const result = await getTelegramFilePath('file-123');
    expect(result).toBe('photos/abc.jpg');
  });

  it('calls the Telegram getFile endpoint with the correct file_id', async () => {
    mockOkJson({ result: { file_path: 'photos/abc.jpg' } });

    await getTelegramFilePath('my-file-id');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('file_id=my-file-id')
    );
  });

  it('throws when TELEGRAM_CHAT_BOT_TOKEN is not set', async () => {
    delete process.env.TELEGRAM_CHAT_BOT_TOKEN;

    await expect(getTelegramFilePath('file-123')).rejects.toThrow(
      'TELEGRAM_CHAT_BOT_TOKEN is not set'
    );
  });

  it('throws when the response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    } as never);

    await expect(getTelegramFilePath('file-123')).rejects.toThrow(
      'request failed with status 400'
    );
  });

  it('throws when file_path is missing from the response', async () => {
    mockOkJson({ result: {} });

    await expect(getTelegramFilePath('file-123')).rejects.toThrow(
      'file_path missing from response'
    );
  });

  it('throws when fileId is an empty string', async () => {
    await expect(getTelegramFilePath('')).rejects.toThrow();
  });

  it('throws when fileId is whitespace only', async () => {
    await expect(getTelegramFilePath('   ')).rejects.toThrow();
  });
});
