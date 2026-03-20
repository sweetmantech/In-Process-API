import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateTelegramChatEnv } from '../validateEnv';

const REQUIRED = [
  'TELEGRAM_CHAT_BOT_TOKEN',
  'TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN',
  'TELEGRAM_CHAT_BOT_USERNAME',
] as const;

describe('validateTelegramChatEnv', () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    REQUIRED.forEach((key) => {
      original[key] = process.env[key];
    });
  });

  afterEach(() => {
    REQUIRED.forEach((key) => {
      process.env[key] = original[key];
    });
  });

  it('does not throw when all env vars are set', () => {
    process.env.TELEGRAM_CHAT_BOT_TOKEN = 'token';
    process.env.TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN = 'secret';
    process.env.TELEGRAM_CHAT_BOT_USERNAME = 'mybot';

    expect(() => validateTelegramChatEnv()).not.toThrow();
  });

  it('throws when all env vars are missing', () => {
    REQUIRED.forEach((key) => delete process.env[key]);

    expect(() => validateTelegramChatEnv()).toThrow(
      '[telegram-chat] Missing required environment variables:'
    );
  });

  it('lists every missing variable in the error message', () => {
    REQUIRED.forEach((key) => delete process.env[key]);

    expect(() => validateTelegramChatEnv()).toThrow(
      '- TELEGRAM_CHAT_BOT_TOKEN'
    );
    expect(() => validateTelegramChatEnv()).toThrow(
      '- TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN'
    );
    expect(() => validateTelegramChatEnv()).toThrow(
      '- TELEGRAM_CHAT_BOT_USERNAME'
    );
  });

  it('throws only for the missing variable when two are set', () => {
    process.env.TELEGRAM_CHAT_BOT_TOKEN = 'token';
    process.env.TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN = 'secret';
    delete process.env.TELEGRAM_CHAT_BOT_USERNAME;

    expect(() => validateTelegramChatEnv()).toThrow(
      '- TELEGRAM_CHAT_BOT_USERNAME'
    );
    expect(() => validateTelegramChatEnv()).not.toThrow(
      expect.stringContaining('TELEGRAM_CHAT_BOT_TOKEN')
    );
  });
});
