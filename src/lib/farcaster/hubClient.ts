import { getInsecureHubRpcClient } from '@farcaster/hub-nodejs';
import { FARCASTER_HUB_GRPC } from '@/lib/consts';

const hubClient = getInsecureHubRpcClient(FARCASTER_HUB_GRPC);

export default hubClient;
