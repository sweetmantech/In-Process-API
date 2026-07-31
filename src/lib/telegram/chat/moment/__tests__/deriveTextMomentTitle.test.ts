import { describe, it, expect } from 'vitest';
import deriveTextMomentTitle from '@/lib/telegram/chat/moment/deriveTextMomentTitle';

describe('deriveTextMomentTitle', () => {
  it('uses the first non-empty line', () => {
    expect(deriveTextMomentTitle('\n  Hello  \nWorld')).toBe('Hello');
  });

  it('falls back to empty string when empty', () => {
    expect(deriveTextMomentTitle('   \n  ')).toBe('');
  });

  it('truncates long first lines', () => {
    const long = 'a'.repeat(120);
    const title = deriveTextMomentTitle(long);
    expect(title.length).toBe(100);
    expect(title.endsWith('…')).toBe(true);
  });
});
