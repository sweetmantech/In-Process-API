import getPrivyApiAuthHeader from '@/lib/privy/getPrivyApiAuthHeader';

type PrivyWalletResponse = {
  address?: string;
  message?: string;
  error?: string;
};

const createPrivyEmbeddedWallet = async (userId: string): Promise<string> => {
  const response = await fetch('https://api.privy.io/v1/wallets', {
    method: 'POST',
    headers: {
      'privy-app-id': process.env.PRIVY_APP_ID!,
      'Content-Type': 'application/json',
      Authorization: getPrivyApiAuthHeader(),
    },
    body: JSON.stringify({
      chain_type: 'ethereum',
      owner: { user_id: userId },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PrivyWalletResponse;

  if (!response.ok) {
    console.error('[createPrivyEmbeddedWallet] Privy error:', {
      status: response.status,
      data,
    });
    throw new Error(
      data?.error ?? data?.message ?? 'Failed to create Privy wallet'
    );
  }

  const address = data.address?.toLowerCase();
  if (!address) throw new Error('Privy wallet was not created');
  return address;
};

export default createPrivyEmbeddedWallet;
