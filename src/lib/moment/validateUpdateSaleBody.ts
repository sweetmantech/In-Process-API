import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { updateSaleSchema } from '@/lib/schema/updateSaleSchema';
import selectMoments from '@/lib/supabase/in_process_moments/selectMoments';
import selectAdmins from '@/lib/supabase/in_process_admins/selectAdmins';

export type UpdateSaleBody = { callerAddress: string } & z.infer<
  typeof updateSaleSchema
>;

const validateUpdateSaleBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { primaryWallet: callerAddress } = authResult;

  const body = await req.json();
  const result = validate(updateSaleSchema, body);
  if (!result.success) return result.response;

  const { data, error } = await selectMoments({
    moments: [result.data.moment],
  });

  if (error)
    return NextResponse.json({ message: error.message }, { status: 500 });

  const momentRow = data?.[0];
  if (!momentRow)
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const admins = await selectAdmins({
    moments: [
      {
        collectionId: String(momentRow.collection.id),
        token_id: momentRow.token_id,
      },
    ],
    artist_address: callerAddress,
  });
  if (admins.length === 0) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return { callerAddress, ...result.data };
};

export default validateUpdateSaleBody;
