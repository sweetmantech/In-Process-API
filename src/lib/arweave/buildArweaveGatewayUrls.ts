import gateways from './gateways';

const buildArweaveGatewayUrls = (txId: string): string[] => {
  const urls = [
    `https://turbo-gateway.com/${txId}`,
    `https://gateway.irys.xyz/${txId}`,
    ...gateways.map((gateway) => `${gateway}/${txId}`),
    `https://gateway.irys.xyz/mutable/${txId}`,
  ];

  return [...new Set(urls)];
};

export default buildArweaveGatewayUrls;
