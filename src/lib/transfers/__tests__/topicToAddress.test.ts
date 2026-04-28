import { describe, it, expect } from 'vitest';
import { getAddress, type Hex } from 'viem';
import topicToAddress from '../topicToAddress';

describe('topicToAddress', () => {
  it('returns null when topic is undefined', () => {
    expect(topicToAddress(undefined)).toBeNull();
  });

  it('returns null when topic is empty string', () => {
    expect(topicToAddress('')).toBeNull();
  });

  it('decodes a padded indexed address topic (left-padded address in topic word)', () => {
    const padded: Hex =
      '0x0000000000000000000000004444444444444444444444444444444444444444';
    expect(topicToAddress(padded)).toBe(
      getAddress('0x4444444444444444444444444444444444444444')
    );
  });

  it('matches viem checksumming for extracted address', () => {
    const topic: Hex =
      '0x0000000000000000000000af1452d289e22fbd0dea9d5097353c72a90fac33';
    expect(topicToAddress(topic)).toBe(
      getAddress('0xAf1452D289e22FbD0dEa9d5097353c72a90fAC33')
    );
  });

  it('throws when last 40 hex chars are not a valid address', () => {
    const badTopic = `0x${'0'.repeat(24)}${'g'.repeat(40)}` as Hex;
    expect(() => topicToAddress(badTopic)).toThrow();
  });
});
