import { NextResponse } from 'next/server';
import { getMomentAdvancedInfo } from '@/lib/moment/getMomentAdvancedInfo';
import { Moment } from '@/types/moment';

const getSaleHandler = async (moment: Moment) => {
  const { saleConfig } = await getMomentAdvancedInfo(moment);
  if (saleConfig == null) {
    return NextResponse.json(
      { message: 'Sale config not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ saleConfig });
};

export default getSaleHandler;
