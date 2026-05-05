import { describe, it, expect, vi, beforeEach } from 'vitest';
import uploadVideoAttachment from '../uploadVideoAttachment';

vi.mock('@/lib/arweave/uploadToArweave', () => ({ default: vi.fn() }));
vi.mock('@/lib/arweave/uploadJson', () => ({ uploadJson: vi.fn() }));
vi.mock('@/lib/arweave/logArweaveUpload', () => ({ default: vi.fn() }));
vi.mock('@/lib/mux/uploadVideoToMux', () => ({ default: vi.fn() }));
vi.mock('../getTelegramFilePath', () => ({ default: vi.fn() }));
vi.mock('../fetchTelegramFile', () => ({ default: vi.fn() }));

import uploadToArweave from '@/lib/arweave/uploadToArweave';
import { uploadJson } from '@/lib/arweave/uploadJson';
import uploadVideoToMux from '@/lib/mux/uploadVideoToMux';
import getTelegramFilePath from '../getTelegramFilePath';
import fetchTelegramFile from '../fetchTelegramFile';

const BUFFER = Buffer.from('video data');
const THUMB_BUFFER = Buffer.from('thumb data');
const ARTIST = '0xartist';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTelegramFilePath).mockResolvedValue('videos/file.mp4');
  vi.mocked(uploadVideoToMux).mockResolvedValue({
    playbackUrl: 'https://mux.com/play/abc',
    downloadUrl: 'https://mux.com/download/abc',
  } as never);
  vi.mocked(fetchTelegramFile).mockResolvedValue({
    buffer: THUMB_BUFFER,
    mimeType: 'image/jpeg',
  });
  vi.mocked(uploadToArweave).mockResolvedValue({
    arweave_uri: 'ar://thumb-hash',
    winc_cost: '100',
  });
  vi.mocked(uploadJson).mockResolvedValue({
    arweave_uri: 'ar://metadata-hash',
    winc_cost: '100',
  });
});

const makeAttachment = (overrides: Record<string, unknown> = {}) => ({
  type: 'video',
  fetchData: vi.fn().mockResolvedValue(BUFFER),
  ...overrides,
});

describe('uploadVideoAttachment', () => {
  it('throws when attachment has no fetchData', async () => {
    await expect(
      uploadVideoAttachment(
        { type: 'video' } as never,
        'file-id',
        'Video',
        ARTIST
      )
    ).rejects.toThrow('Attachment has no fetchData');
  });

  it('returns uri, mimeType, and mediaUri on success', async () => {
    const result = await uploadVideoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Video',
      ARTIST,
      'thumb-id'
    );

    expect(result).toEqual({
      uri: 'ar://metadata-hash',
      mimeType: 'video/mp4',
      mediaUri: 'https://mux.com/play/abc',
    });
  });

  it('uses attachment.mimeType when provided', async () => {
    const result = await uploadVideoAttachment(
      makeAttachment({ mimeType: 'video/quicktime' }) as never,
      'file-id',
      'My Video',
      ARTIST
    );

    expect(result.mimeType).toBe('video/quicktime');
  });

  describe('with thumbFileId', () => {
    it('fetches the thumbnail file', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST,
        'thumb-id'
      );
      expect(fetchTelegramFile).toHaveBeenCalledWith('thumb-id');
    });

    it('uploads thumbnail to Arweave', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST,
        'thumb-id'
      );
      expect(uploadToArweave).toHaveBeenCalledOnce();
    });

    it('includes image in metadata', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST,
        'thumb-id'
      );
      expect(uploadJson).toHaveBeenCalledWith(
        expect.objectContaining({ image: 'ar://thumb-hash' })
      );
    });
  });

  describe('without thumbFileId', () => {
    it('does not fetch any thumbnail', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST
      );
      expect(fetchTelegramFile).not.toHaveBeenCalled();
    });

    it('does not upload to Arweave', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST
      );
      expect(uploadToArweave).not.toHaveBeenCalled();
    });

    it('omits image from metadata', async () => {
      await uploadVideoAttachment(
        makeAttachment() as never,
        'file-id',
        'My Video',
        ARTIST
      );
      const callArg = vi.mocked(uploadJson).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(callArg).not.toHaveProperty('image');
    });
  });

  it('includes animation_url and content in metadata', async () => {
    await uploadVideoAttachment(
      makeAttachment() as never,
      'file-id',
      'My Video',
      ARTIST
    );

    expect(uploadJson).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My Video',
        animation_url: 'https://mux.com/play/abc',
        content: {
          mime: 'video/mp4',
          uri: 'https://mux.com/download/abc',
        },
      })
    );
  });
});
