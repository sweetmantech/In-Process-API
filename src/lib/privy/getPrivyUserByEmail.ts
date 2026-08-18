import privyClient from '@/lib/privy/client';

const getPrivyUserByEmail = async (email: string) => {
  try {
    return await privyClient
      .users()
      .getByEmailAddress({ address: email.trim().toLowerCase() });
  } catch {
    return null;
  }
};

export default getPrivyUserByEmail;
