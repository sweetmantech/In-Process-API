import { NextResponse } from 'next/server';
import { CreateNounsProposalInput } from '@/lib/schema/createNounsProposalSchema';
import createBatchSetupActions from '@/lib/moment/createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { getNounsProposalCalldata } from './getNounsProposalCalldata';
import { getNounsProposalThreshold } from './getNounsProposalThreshold';
import { getWalletSmartAccount } from '../coinbase/getWalletSmartAccount';

const createNounsProposalHandler = async (
  input: CreateNounsProposalInput
): Promise<NextResponse> => {
  const { chainId, account, proposal } = input;

  const smartAccount = await getWalletSmartAccount({ address: account });

  const { tokenSetupActions, fundsRecipient } = await createBatchSetupActions({
    input,
    smartAccount,
  });

  const { to: callTo, data: functionCallData } = createMomentBatchCall({
    input,
    tokenSetupActions,
    fundsRecipient,
  });

  const proposalDescription = `# ${proposal.title}\n\n${proposal.description}`;
  const transaction = getNounsProposalCalldata({
    chainId,
    target: callTo,
    calldata: functionCallData,
    description: proposalDescription,
  });

  const proposalThreshold = await getNounsProposalThreshold(chainId);

  return NextResponse.json({
    transaction,
    proposalThreshold,
  });
};

export default createNounsProposalHandler;
