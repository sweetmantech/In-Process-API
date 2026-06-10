import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { CreateNounsProposalInput } from '@/lib/schema/createNounsProposalSchema';
import createBatchSetupActions from '@/lib/moment/createBatchSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import { getNounsProposalCalldata } from './getNounsProposalCalldata';
import { getNounsProposalThreshold } from './getNounsProposalThreshold';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import getOrCreateArtist from '@/lib/artists/getOrCreateArtist';
import selectWallets from '../supabase/in_process_wallets/selectWallets';
import { getLegacySmartAccount } from '../coinbase/getLegacySmartAccount';

const createNounsProposalHandler = async (
  input: CreateNounsProposalInput
): Promise<NextResponse> => {
  const { chainId, account, contract, proposal } = input;

  const { data: walletRows } = await selectWallets({addresses:[account]})
  const artistId = walletRows?.[0]?.artist_id

  const smartAccount = artistId
    ? await getOperationalSmartWallet({
        artist: await getOrCreateArtist({ address: account }),
        moment: {
          collectionAddress: contract.address as Address | undefined,
          chainId,
          tokenId: '0',
        },
      })
    : await getLegacySmartAccount({ address: account });

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
