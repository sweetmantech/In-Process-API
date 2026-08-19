const REQUIRED_ENV_VARS = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'] as const;

export function validateResendEnv(): {
  apiKey: string;
  fromEmail: string;
} {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `[resend] Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join('\n')}`
    );
  }

  return {
    apiKey: process.env.RESEND_API_KEY as string,
    fromEmail: process.env.RESEND_FROM_EMAIL as string,
  };
}
