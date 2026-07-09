import { describe, it, expect } from 'vitest';
import resolveMediaAttachmentType from '../resolveMediaAttachmentType';

describe('resolveMediaAttachmentType', () => {
  it('passes through an image attachment sent as a compressed photo', () => {
    const result = resolveMediaAttachmentType({
      type: 'image',
      mimeType: 'image/jpeg',
    } as never);
    expect(result).toBe('image');
  });

  it('passes through a video attachment', () => {
    const result = resolveMediaAttachmentType({
      type: 'video',
      mimeType: 'video/mp4',
    } as never);
    expect(result).toBe('video');
  });

  it('resolves a document with an image mimeType to image', () => {
    const result = resolveMediaAttachmentType({
      type: 'file',
      mimeType: 'image/jpeg',
    } as never);
    expect(result).toBe('image');
  });

  it('resolves a document with a video mimeType to video', () => {
    const result = resolveMediaAttachmentType({
      type: 'file',
      mimeType: 'video/mp4',
    } as never);
    expect(result).toBe('video');
  });

  it('returns undefined for a document with a non-media mimeType', () => {
    const result = resolveMediaAttachmentType({
      type: 'file',
      mimeType: 'application/pdf',
    } as never);
    expect(result).toBeUndefined();
  });

  it('returns undefined for a document with no mimeType', () => {
    const result = resolveMediaAttachmentType({
      type: 'file',
    } as never);
    expect(result).toBeUndefined();
  });

  it('returns undefined for audio attachments', () => {
    const result = resolveMediaAttachmentType({
      type: 'audio',
      mimeType: 'audio/mpeg',
    } as never);
    expect(result).toBeUndefined();
  });
});
