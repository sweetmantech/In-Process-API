import { describe, it, expect } from 'vitest';
import getMimeTypeFromFilePath from '@/lib/telegram/chat/attachment/getMimeTypeFromFilePath';

describe('getMimeTypeFromFilePath', () => {
  it.each([
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['image.png', 'image/png'],
    ['animation.gif', 'image/gif'],
    ['photo.webp', 'image/webp'],
    ['photo.heic', 'image/heic'],
    ['photo.heif', 'image/heif'],
    ['video.mp4', 'video/mp4'],
    ['video.mov', 'video/quicktime'],
    ['video.avi', 'video/x-msvideo'],
    ['audio.mp3', 'audio/mpeg'],
    ['audio.ogg', 'audio/ogg'],
    ['audio.wav', 'audio/wav'],
    ['audio.m4a', 'audio/mp4'],
    ['audio.aac', 'audio/aac'],
    ['audio.flac', 'audio/flac'],
    ['audio.aiff', 'audio/aiff'],
    ['audio.aif', 'audio/aiff'],
    ['audio.wma', 'audio/x-ms-wma'],
    ['document.pdf', 'application/pdf'],
  ])('%s → %s', (path, expected) => {
    expect(getMimeTypeFromFilePath(path)).toBe(expected);
  });

  it('returns application/octet-stream for an unknown extension', () => {
    expect(getMimeTypeFromFilePath('file.xyz')).toBe(
      'application/octet-stream'
    );
  });

  it('returns application/octet-stream when there is no extension', () => {
    expect(getMimeTypeFromFilePath('filename')).toBe(
      'application/octet-stream'
    );
  });

  it('handles uppercase extensions case-insensitively', () => {
    expect(getMimeTypeFromFilePath('PHOTO.JPG')).toBe('image/jpeg');
    expect(getMimeTypeFromFilePath('video.MP4')).toBe('video/mp4');
  });

  it('resolves from the last dot in paths with multiple dots', () => {
    expect(getMimeTypeFromFilePath('some.path/to/file.mp4')).toBe('video/mp4');
    expect(getMimeTypeFromFilePath('my.moment.name.jpg')).toBe('image/jpeg');
  });
});
