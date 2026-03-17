import { NextResponse } from 'next/server';
import { resolveMomentInfo } from '@/lib/moment/resolveMomentInfo';
import { Moment } from '@/types/moment';

const getSaleHandler = async (moment: Moment) => {
  const { saleConfig } = await resolveMomentInfo(moment);
  if (saleConfig == null) {
    return NextResponse.json(
      { message: 'Sale config not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ saleConfig });
};

export default getSaleHandler;
