import { Tables } from '../supabase/types';

const getPrimaryWallet = (
  wallets: Tables<'in_process_wallets'>[] | null | undefined
): string | undefined => {
  if (!wallets?.length) return undefined;
  const privyWallet = wallets.find((w) => w.type === 'privy');
  const externalWallet = wallets.find((w) => w.type === 'external');
  return (
    privyWallet?.address ??
    externalWallet?.address ??
    wallets[0].address ??
    undefined
  );
};
export default getPrimaryWallet;
