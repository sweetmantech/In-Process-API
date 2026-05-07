const RECAPTCHA_VERIFY_URL = 'https://google.com/recaptcha/api/siteverify';

const verifyRecaptchaToken = async (token: string): Promise<boolean> => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return false;

  const res = await fetch(RECAPTCHA_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await res.json();
  return data.success === true;
};

export default verifyRecaptchaToken;
