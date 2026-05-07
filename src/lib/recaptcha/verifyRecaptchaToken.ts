const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

const verifyRecaptchaToken = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;

  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
};

export default verifyRecaptchaToken;
