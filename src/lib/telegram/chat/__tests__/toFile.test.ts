import { describe, it, expect } from 'vitest';
import toFile from '../toFile';

describe('toFile', () => {
  it('returns a File instance', () => {
    const file = toFile(Buffer.from('hello'), 'test.jpg', 'image/jpeg');
    expect(file).toBeInstanceOf(File);
  });

  it('sets the correct name', () => {
    const file = toFile(Buffer.from('hello'), 'my-photo.png', 'image/png');
    expect(file.name).toBe('my-photo.png');
  });

  it('sets the correct MIME type', () => {
    const file = toFile(Buffer.from('hello'), 'video.mp4', 'video/mp4');
    expect(file.type).toBe('video/mp4');
  });

  it('file size matches the buffer byte length', () => {
    const buffer = Buffer.from('hello world');
    const file = toFile(buffer, 'file.txt', 'text/plain');
    expect(file.size).toBe(buffer.byteLength);
  });

  it('file contents match the original buffer', async () => {
    const buffer = Buffer.from([1, 2, 3, 4, 5]);
    const file = toFile(buffer, 'data.bin', 'application/octet-stream');
    const result = await file.arrayBuffer();
    expect(new Uint8Array(result)).toEqual(new Uint8Array(buffer));
  });

  it('handles an empty buffer', () => {
    const file = toFile(
      Buffer.alloc(0),
      'empty.bin',
      'application/octet-stream'
    );
    expect(file.size).toBe(0);
  });

  it('falls back to "upload" when name is empty', () => {
    const file = toFile(Buffer.from('data'), '', 'image/jpeg');
    expect(file.name).toBe('upload');
  });
});
