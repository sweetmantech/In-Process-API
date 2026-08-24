import { describe, it, expect, vi, beforeEach } from 'vitest';
import uploadAudioAttachment from '@/lib/telegram/chat/moment/uploadAudioAttachment';

vi.mock('@/lib/supabase/storage/uploadFileToSupabase', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/supabase/storage/uploadJsonToSupabase', () => ({
  default: vi.fn(),
}));
vi.mock('@/lib/telegram/chat/attachment/getTelegramFilePath', () => ({
  default: vi.fn(),
}));
vi.mock('uuid', () => ({ v4: () => 'mock-uuid-1234' }));

import uploadFileToSupabase from '@/lib/supabase/storage/uploadFileToSupabase';
import uploadJsonToSupabase from '@/lib/supabase/storage/uploadJsonToSupabase';
import getTelegramFilePath from '@/lib/telegram/chat/attachment/getTelegramFilePath';

const BUFFER = Buffer.from('audio data');
const AUDIO_URL =
  'https://supabase.co/storage/v1/object/public/bucket/track.wav';
const META_URL =
  'https://supabase.co/storage/v1/object/public/bucket/meta.json';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTelegramFilePath).mockResolvedValue('documents/file.wav');
  vi.mocked(uploadFileToSupabase).mockResolvedValue(AUDIO_URL);
  vi.mocked(uploadJsonToSupabase).mockResolvedValue(META_URL);
});

const makeAttachment = (overrides: Record<string, unknown> = {}) => ({
  type: 'audio',
  fetchData: vi.fn().mockResolvedValue(BUFFER),
  ...overrides,
});

describe('uploadAudioAttachment', () => {
  it('throws when attachment has no fetchData', async () => {
    await expect(
      uploadAudioAttachment({ type: 'audio' } as never, 'file-id', 'Track')
    ).rejects.toThrow('Attachment has no fetchData');
  });

  it('returns uri, mimeType, and mediaUri on success', async () => {
    const result = await uploadAudioAttachment(
      makeAttachment() as never,
      'file-id',
      'My Track'
    );

    expect(result).toEqual({
      uri: META_URL,
      mimeType: 'audio/wav',
      mediaUri: AUDIO_URL,
    });
  });

  it('uses attachment.mimeType when provided', async () => {
    const result = await uploadAudioAttachment(
      makeAttachment({ mimeType: 'audio/mpeg' }) as never,
      'file-id',
      'My Track'
    );

    expect(result.mimeType).toBe('audio/mpeg');
  });

  it('falls back to getMimeTypeFromFilePath when attachment has no mimeType', async () => {
    vi.mocked(getTelegramFilePath).mockResolvedValue('documents/file.mp3');

    const result = await uploadAudioAttachment(
      makeAttachment() as never,
      'file-id',
      'My Track'
    );

    expect(result.mimeType).toBe('audio/mpeg');
  });

  it('uploads audio file to Supabase with correct name and mimeType', async () => {
    await uploadAudioAttachment(
      makeAttachment() as never,
      'file-id',
      'My Track'
    );

    expect(uploadFileToSupabase).toHaveBeenCalledOnce();
    const [file] = vi.mocked(uploadFileToSupabase).mock.calls[0];
    expect(file.name).toBe('My Track');
    expect(file.type).toBe('audio/wav');
  });

  it('uploads JSON metadata with animation_url and content for music posts', async () => {
    await uploadAudioAttachment(
      makeAttachment() as never,
      'file-id',
      'My Track'
    );

    expect(uploadJsonToSupabase).toHaveBeenCalledWith({
      name: 'My Track',
      animation_url: AUDIO_URL,
      content: { mime: 'audio/wav', uri: AUDIO_URL },
    });
  });
});
