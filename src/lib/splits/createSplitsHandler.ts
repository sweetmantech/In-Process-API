import { NextResponse } from 'next/server';
import { CHAIN_ID } from '@/lib/consts';
import { getWalletSmartAccount } from '@/lib/coinbase/getWalletSmartAccount';
import { normalizeSplitRecipients } from '@/lib/splits/normalizeSplitRecipients';
import { processSplits } from '@/lib/splits/processSplits';
import type { CreateSplitsBody } from '@/lib/splits/validateCreateSplitsBody';

const createSplitsHandler = async ({ artist, splits }: CreateSplitsBody) => {
  const smartAccount = await getWalletSmartAccount({
    address: artist.primaryWallet,
  });
  const resolvedSplits = await normalizeSplitRecipients(splits);
  const { splitAddress } = await processSplits(resolvedSplits, smartAccount);

  if (!splitAddress) {
    return NextResponse.json(
      { message: 'Failed to create split' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    splitAddress,
    chainId: CHAIN_ID,
  });
};

export default createSplitsHandler;
