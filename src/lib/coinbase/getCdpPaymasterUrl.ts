export type CdpPaymasterNetwork = 'base' | 'base-sepolia';

const COINBASE_PAYMASTER_RPC_PREFIX =
  'https://api.developer.coinbase.com/rpc/v1';

export default function getCdpPaymasterUrl(
  network: CdpPaymasterNetwork
): string {
  const key = process.env.CDP_PAYMASTER_KEY?.trim();
  if (!key) {
    throw new Error('CDP_PAYMASTER_KEY is not set');
  }

  return `${COINBASE_PAYMASTER_RPC_PREFIX}/${network}/${key.trim()}`;
}
