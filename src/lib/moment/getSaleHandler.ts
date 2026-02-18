import { NextResponse } from 'next/server';
import { getMomentAdvancedInfo } from '@/lib/moment/getMomentAdvancedInfo';
import { Moment } from '@/types/moment';

const getSaleHandler = async (moment: Moment) => {
  const { saleConfig } = await getMomentAdvancedInfo(moment);
  return NextResponse.json({ saleConfig });
};

export default getSaleHandler;
