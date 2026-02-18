import { NextResponse } from 'next/server';
import { Address } from 'viem';
import { Moment } from '@/types/moment';
import getMomentOnChainInfo from '@/lib/viem/getMomentOnChainInfo';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateSaleCall from '@/lib/sales/getUpdateSaleCall';
import { baseSepolia } from 'viem/chains';

const updateSaleHandler = async (
  moment: Moment,
  callerAddress: string,
  pricePerToken?: string,
  saleStart?: string,
  saleEnd?: string,
  maxTokensPerAddress?: number,
  fundsRecipient?: string
) => {
  const { saleConfig } = await getMomentOnChainInfo(moment);

  if (!saleConfig) {
    return NextResponse.json(
      { message: 'Sale config not found' },
      { status: 404 }
    );
  }

  const { type, ...rawSale } = saleConfig;

  const saleStartDate = saleStart ? new Date(saleStart) : null;
  const saleEndDate = saleEnd ? new Date(saleEnd) : null;

  const newSale = {
    ...rawSale,
    saleStart: saleStartDate
      ? BigInt(Number(saleStartDate.getTime() / 1000).toFixed(0))
      : rawSale.saleStart,
    saleEnd: saleEndDate
      ? BigInt(Number(saleEndDate.getTime() / 1000).toFixed(0))
      : BigInt(rawSale.saleEnd),
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

  const smartAccount = await getOrCreateSmartWallet({
    address: callerAddress as Address,
  });

  const transaction = await sendUserOperation({
    smartAccount,
    network: moment.chainId === baseSepolia.id ? 'base-sepolia' : 'base',
    calls: [updateSaleCall],
  });

  return NextResponse.json({
    hash: transaction.transactionHash,
    chainId: moment.chainId,
  });
};

export default updateSaleHandler;
