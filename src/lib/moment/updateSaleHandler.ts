import type { ArtistContext } from '@/types/artist';
import { NextResponse } from 'next/server';
import { Address } from 'viem';
import getInProcessMomentInfo from '@/lib/viem/getInProcessMomentInfo';
import { getOperationalSmartWallet } from '@/lib/smartwallets/getOperationalSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateSaleCall from '@/lib/sales/getUpdateSaleCall';
import indexSale from '@/lib/sales/indexSale';
import { baseSepolia } from 'viem/chains';
import { UpdateSaleBody } from '@/lib/moment/validateUpdateSaleBody';

const updateSaleHandler = async ({
  moment,
  artist,
  pricePerToken,
  saleStart,
  saleEnd,
  maxTokensPerAddress,
  fundsRecipient,
}: UpdateSaleBody) => {
  const { saleConfig } = await getInProcessMomentInfo(moment);

  if (!saleConfig) {
    return NextResponse.json(
      { message: 'Sale config not found' },
      { status: 404 }
    );
  }

  const { type, ...rawSale } = saleConfig;

  const newSale = {
    ...rawSale,
    saleStart: saleStart !== undefined ? BigInt(saleStart) : rawSale.saleStart,
    saleEnd: saleEnd !== undefined ? BigInt(saleEnd) : BigInt(rawSale.saleEnd),
    pricePerToken: pricePerToken
      ? BigInt(pricePerToken)
      : BigInt(rawSale.pricePerToken),
    maxTokensPerAddress:
      maxTokensPerAddress !== undefined
        ? BigInt(maxTokensPerAddress)
        : BigInt(rawSale.maxTokensPerAddress),
    fundsRecipient: (fundsRecipient ?? rawSale.fundsRecipient) as Address,
  };

  const updateSaleCall = getUpdateSaleCall(moment, type, newSale);

  const smartAccount = await getOperationalSmartWallet({ artist, moment });

  const transaction = await sendUserOperation({
    smartAccount,
    network: moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base',
    calls: [updateSaleCall],
  });

  try {
    await indexSale({ moment, sale: newSale });
  } catch (e) {
    console.error('Error indexing sale:', e);
  }

  return NextResponse.json({
    hash: transaction.transactionHash,
    chainId: moment.chainId,
  });
};

export default updateSaleHandler;
