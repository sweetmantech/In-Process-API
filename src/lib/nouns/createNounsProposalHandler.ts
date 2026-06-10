import { NextResponse } from 'next/server';
import { mainnet } from 'viem/chains';
import { CreateNounsProposalInput } from '@/lib/schema/createNounsProposalSchema';
import { getInProcessFactoryCalldata } from './getInProcessFactoryCalldata';
import { getNounsProposalCalldata } from './getNounsProposalCalldata';
import { getNounsProposalThreshold } from './getNounsProposalThreshold';

const createNounsProposalHandler = async (
  input: CreateNounsProposalInput
): Promise<NextResponse> => {
  const { chainId, account, collection, token, proposal } = input;

  const factoryCall = getInProcessFactoryCalldata({
    chainId,
    collectionUri: collection.uri,
    collectionName: collection.name,
    tokenUri: token.uri,
    maxSupply: token.maxSupply,
    account,
  });

  const proposalDescription = `# ${proposal.title}\n\n${proposal.description}`;
  const transaction = getNounsProposalCalldata({
    chainId,
    target: factoryCall.to,
    calldata: factoryCall.data,
    description: proposalDescription,
  });

  const proposalThreshold = await getNounsProposalThreshold(chainId);

  const nounsUrl =
    chainId === mainnet.id
      ? 'https://nouns.camp/proposals/new'
      : 'https://nouns.camp/proposals/new?chain=sepolia';

  return NextResponse.json({
    transaction,
    proposalThreshold,
    currentProposerVotes: null,
    nounsUrl,
  });
};

export default createNounsProposalHandler;
