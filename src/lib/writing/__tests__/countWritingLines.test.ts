import { describe, it, expect } from 'vitest';
import countWritingLines from '../countWritingLines';

describe('countWritingLines', () => {
  it('counts one line for short text', () => {
    expect(countWritingLines('hello')).toBe(1);
  });

  it('adds a line per newline paragraph', () => {
    expect(countWritingLines('a\nb')).toBe(2);
  });

  it('wraps long paragraphs at 64 characters', () => {
    expect(countWritingLines('a'.repeat(64))).toBe(2);
    expect(countWritingLines('a'.repeat(65))).toBe(2);
  });
});
