import { Address } from 'viem';
import {
  REFERRAL_RECIPIENT,
  SITE_ORIGINAL_URL,
  USDC_ADDRESS,
} from '@/lib/consts';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { uploadJson } from '@/lib/arweave/uploadJson';
import { MomentType, UpdateCollectionCallInput } from '@/types/moment';
import { addPermissionCall } from '@/lib/zora/addPermissionCall';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import getTokenSetupActions from './getTokenSetupActions';
import createMomentBatchCall from '@/lib/viem/createMomentBatchCall';
import selectCollection from '@/lib/supabase/in_process_collections/selectCollection';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';

const getUpdateCollectionCall = async ({
  moment,
  contract,
  artistAddress,
}: UpdateCollectionCallInput) => {
  const [{ saleConfig }, { data: collection }] = await Promise.all([
    getInProcessMomentInfo(moment),
    selectCollection({ address: contract.address, chainId: moment.chainId }),
  ]);

  const collectionId = collection?.id;
  const admins = collectionId
    ? await selectAdmins({
        moments: [{ collectionId, token_id: Number(moment.tokenId) }],
      })
    : [];

  const permissionSetupActions = ({ tokenId }: { tokenId: bigint }) =>
    admins.map((admin) =>
      addPermissionCall(admin.artist_address as Address, tokenId)
    );

  const batchInput = createMomentBatchSchema.parse({
    contract: { address: contract.address },
    tokens: [
      {
        tokenMetadataURI: contract.uri,
        createReferral: REFERRAL_RECIPIENT,
        salesConfig: {
          type: saleConfig.type,
          pricePerToken: saleConfig.pricePerToken,
          saleStart: saleConfig.saleStart,
          saleEnd: saleConfig.saleEnd,
          ...(saleConfig.type === MomentType.Erc20Mint && {
            currency: USDC_ADDRESS[moment.chainId],
          }),
        },
        mintToCreatorCount: 1,
        payoutRecipient: saleConfig.fundsRecipient,
      },
    ],
    account: artistAddress,
    chainId: moment.chainId,
  });

  const { tokenSetupActions, firstTokenId } = await getTokenSetupActions({
    input: batchInput,
    splitAddress: undefined,
    permissionSetupActions,
  });

  const { arweave_uri: resetUri } = await uploadJson({
    name: '',
    description: '',
    external_url: `${SITE_ORIGINAL_URL}/collect/base:${contract.address}/${firstTokenId}`,
    image: '',
    animation_url: null,
    content: { mime: '', uri: '' },
  });

  const { to, data } = createMomentBatchCall({
    input: batchInput,
    tokenSetupActions,
    fundsRecipient: saleConfig.fundsRecipient,
  });

  return {
    call: { to, data },
    resetUri,
    contractAddress: contract.address,
    tokenId: firstTokenId.toString(),
  };
};

export default getUpdateCollectionCall;
