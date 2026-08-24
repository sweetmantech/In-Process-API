import { describe, it, expect } from 'vitest';
import detectMimeTypeFromBuffer from '@/lib/telegram/chat/attachment/detectMimeTypeFromBuffer';

describe('detectMimeTypeFromBuffer', () => {
  it('returns undefined for unknown bytes', () => {
    expect(
      detectMimeTypeFromBuffer(Buffer.from('not-an-image'))
    ).toBeUndefined();
  });

  it('detects WAV from RIFF/WAVE magic bytes', () => {
    const buffer = Buffer.alloc(12);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(4, 4);
    buffer.write('WAVE', 8);

    expect(detectMimeTypeFromBuffer(buffer)).toBe('audio/wav');
  });

  it('detects WebP from RIFF/WEBP magic bytes', () => {
    const buffer = Buffer.alloc(12);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(4, 4);
    buffer.write('WEBP', 8);

    expect(detectMimeTypeFromBuffer(buffer)).toBe('image/webp');
  });
});
