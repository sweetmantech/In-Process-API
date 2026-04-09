import { getSSLHubRpcClient } from '@farcaster/hub-nodejs';
import { FARCASTER_HUB_GRPC } from '@/lib/consts';

const hubClient = getSSLHubRpcClient(FARCASTER_HUB_GRPC);

export default hubClient;
