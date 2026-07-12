import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../resolveMediaAttachmentType', () => ({ default: vi.fn() }));
vi.mock('../extractTelegramFileIds', () => ({ default: vi.fn() }));
vi.mock('../fetchTelegramFile', () => ({ default: vi.fn() }));

import resolveMediaAttachmentType from '@/lib/telegram/chat/attachment/resolveMediaAttachmentType';
import extractTelegramFileIds from '@/lib/telegram/chat/attachment/extractTelegramFileIds';
import fetchTelegramFile from '@/lib/telegram/chat/attachment/fetchTelegramFile';
import resolveTelegramMediaAttachment from '@/lib/telegram/chat/attachment/resolveTelegramMediaAttachment';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('resolveTelegramMediaAttachment', () => {
  it('returns the attachment with a resolved type when mime is already known', async () => {
    vi.mocked(resolveMediaAttachmentType).mockReturnValue('image');
    const attachment = { type: 'file', mimeType: 'image/jpeg' } as never;

    const result = await resolveTelegramMediaAttachment(
      { attachments: [attachment] } as never,
      attachment
    );

    expect(result).toEqual({
      type: 'image',
      mimeType: 'image/jpeg',
    });
    expect(fetchTelegramFile).not.toHaveBeenCalled();
  });

  it('sniffs mime from Telegram file bytes when the document has no useful mimeType', async () => {
    vi.mocked(resolveMediaAttachmentType)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce('image');
    vi.mocked(extractTelegramFileIds).mockReturnValue({
      fileId: 'file-1',
      thumbFileId: undefined,
    });
    vi.mocked(fetchTelegramFile).mockResolvedValue({
      buffer: Buffer.from('bytes'),
      mimeType: 'image/heic',
    });

    const attachment = {
      type: 'file',
      mimeType: 'application/octet-stream',
    } as never;

    const result = await resolveTelegramMediaAttachment(
      { attachments: [attachment] } as never,
      attachment
    );

    expect(fetchTelegramFile).toHaveBeenCalledWith('file-1');
    expect(result).toEqual({
      type: 'image',
      mimeType: 'image/heic',
    });
  });

  it('returns undefined when sniffing still does not resolve to media', async () => {
    vi.mocked(resolveMediaAttachmentType).mockReturnValue(undefined);
    vi.mocked(extractTelegramFileIds).mockReturnValue({
      fileId: 'file-1',
      thumbFileId: undefined,
    });
    vi.mocked(fetchTelegramFile).mockResolvedValue({
      buffer: Buffer.from('bytes'),
      mimeType: 'application/octet-stream',
    });

    const attachment = { type: 'file' } as never;

    const result = await resolveTelegramMediaAttachment(
      { attachments: [attachment] } as never,
      attachment
    );

    expect(result).toBeUndefined();
  });
});
