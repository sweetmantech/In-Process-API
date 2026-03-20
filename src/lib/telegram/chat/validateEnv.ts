const REQUIRED_ENV_VARS = [
  'TELEGRAM_CHAT_BOT_TOKEN',
  'TELEGRAM_CHAT_WEBHOOK_SECRET_TOKEN',
  'TELEGRAM_CHAT_BOT_USERNAME',
] as const;

export function validateTelegramChatEnv(): void {
  const missing: string[] = REQUIRED_ENV_VARS.filter(
    (name) => !process.env[name]
  );

  if (missing.length > 0) {
    throw new Error(
      `[telegram-chat] Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}`
    );
  }
}
