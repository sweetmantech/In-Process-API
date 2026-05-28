import { Tables } from '../supabase/types';

const getPrimaryWallet = (
  wallets: Tables<'in_process_wallets'>[] | null | undefined
): string | undefined => {
  if (!wallets?.length) return undefined;
  const externalWallet = wallets.find((w) => w.type === 'external');
  const privyWallet = wallets.find((w) => w.type === 'privy');
  return (
    externalWallet?.address ??
    privyWallet?.address ??
    wallets[0].address ??
    undefined
  );
};
export default getPrimaryWallet;
