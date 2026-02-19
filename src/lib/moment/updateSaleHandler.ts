import { NextResponse } from 'next/server';
import { Address } from 'viem';
import getMomentOnChainInfo from '@/lib/viem/getMomentOnChainInfo';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { sendUserOperation } from '@/lib/coinbase/sendUserOperation';
import getUpdateSaleCall from '@/lib/sales/getUpdateSaleCall';
import { baseSepolia } from 'viem/chains';
import { UpdateSaleBody } from '@/lib/moment/validateUpdateSaleBody';

const updateSaleHandler = async ({
  moment,
  callerAddress,
  pricePerToken,
  saleStart,
  saleEnd,
  maxTokensPerAddress,
  fundsRecipient,
}: UpdateSaleBody) => {
  const { saleConfig } = await getMomentOnChainInfo(moment);

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
