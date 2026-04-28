import { getAddress, type Hex } from 'viem';

const topicToAddress = (topic: Hex | '' | undefined) =>
  topic ? getAddress(`0x${topic.slice(-40)}` as Hex) : null;

export default topicToAddress;
