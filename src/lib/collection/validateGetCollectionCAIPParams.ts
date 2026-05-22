import { NextResponse } from 'next/server';
import addressSchema from '@/lib/schema/addressSchema';
import chainIdSchema from '@/lib/schema/chainIdSchema';

const validateGetCollectionCAIPParams = (params: {
  network: string;
  contract: string;
}) => {
  const [networkNamespace, chainIdRaw] = params.network.split(':');
  const [assetNamespace, addressRaw] = params.contract.split(':');

  if (networkNamespace !== 'eip155')
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unsupported network namespace, expected eip155',
      },
      { status: 400 }
    );

  if (assetNamespace !== 'erc1155')
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unsupported asset namespace, expected erc1155',
      },
      { status: 400 }
    );

  const chainIdResult = chainIdSchema.safeParse(chainIdRaw);
  if (!chainIdResult.success)
    return NextResponse.json(
      { status: 'error', message: 'Invalid network param' },
      { status: 400 }
    );

  const addressResult = addressSchema.safeParse(addressRaw);
  if (!addressResult.success)
    return NextResponse.json(
      { status: 'error', message: 'Invalid contract param' },
      { status: 400 }
    );

  return { chainId: chainIdResult.data, collectionAddress: addressResult.data };
};

export default validateGetCollectionCAIPParams;
