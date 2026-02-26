import wayfinderClient from './wayfinderClient';

const getArweaveGateway = async (): Promise<URL> => {
  const { strategy } = wayfinderClient.routingSettings;
  if (!strategy) throw new Error('Wayfinder routing strategy not configured');
  return strategy.selectGateway({});
};

export default getArweaveGateway;
