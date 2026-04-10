import { describe, it, expect, vi } from 'vitest';
import { getRetryDelay } from '../getRetryDelay';

describe('getRetryDelay', () => {
  it('uses exponential backoff for non-objects', () => {
    expect(getRetryDelay(null, 0, 1000)).toBe(1000);
    expect(getRetryDelay(null, 1, 1000)).toBe(2000);
    expect(getRetryDelay(null, 2, 1000)).toBe(4000);
  });

  it('uses exponential backoff for string errors', () => {
    expect(getRetryDelay('error', 0, 500)).toBe(500);
    expect(getRetryDelay('error', 1, 500)).toBe(1000);
  });

  it('uses retry-after from response.headers', () => {
    const error = { response: { headers: { 'retry-after': '30' } } };
    expect(getRetryDelay(error, 0, 1000)).toBe(30000);
  });

  it('uses retry-after from top-level headers', () => {
    const error = { headers: { 'retry-after': '10' } };
    expect(getRetryDelay(error, 0, 1000)).toBe(10000);
  });

  it('ignores retry-after if not a positive number', () => {
    const error = { headers: { 'retry-after': '0' } };
    expect(getRetryDelay(error, 0, 1000)).toBe(1000);
  });

  it('ignores retry-after if NaN', () => {
    const error = { headers: { 'retry-after': 'invalid' } };
    expect(getRetryDelay(error, 0, 1000)).toBe(1000);
  });

  it('uses 5000 base for rate limit errors (no retry-after)', () => {
    const error = { status: 429 };
    expect(getRetryDelay(error, 0, 1000)).toBe(5000);
    expect(getRetryDelay(error, 1, 1000)).toBe(10000);
  });

  it('prefers retry-after over rate limit 5x delay', () => {
    const error = { status: 429, headers: { 'retry-after': '60' } };
    expect(getRetryDelay(error, 0, 1000)).toBe(60000);
  });

  it('falls back to base delay exponential for plain object errors', () => {
    const error = { message: 'some error' };
    expect(getRetryDelay(error, 0, 200)).toBe(200);
    expect(getRetryDelay(error, 2, 200)).toBe(800);
  });
});
