import { NextResponse } from 'next/server';
import { GetNounsProposalActionInput } from '@/lib/schema/getNounsProposalActionSchema';
import createBatchSetupActions from '@/lib/moment/createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { getWalletSmartAccount } from '../coinbase/getWalletSmartAccount';
import { getNounsGovernorAddress } from './getNounsGovernorAddress';

const getNounsProposalActionHandler = async (
  input: GetNounsProposalActionInput
): Promise<NextResponse> => {
  const { chainId, account, proposal } = input;

  const smartAccount = await getWalletSmartAccount({ address: account });

  const { tokenSetupActions, fundsRecipient } = await createBatchSetupActions({
    input,
    smartAccount,
  });

  const { to: target, data: calldata } = createMomentBatchCall({
    input,
    tokenSetupActions,
    fundsRecipient,
  });

  const description = `# ${proposal.title}\n\n${proposal.description}`;

  return NextResponse.json({
    governor: getNounsGovernorAddress(chainId),
    args: [[target], ['0'], [''], [calldata], description],
    value: '0',
  });
};

export default getNounsProposalActionHandler;
