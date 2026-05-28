import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { permissionSchema } from '@/lib/schema/permissionSchema';

const validatePermissionBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const body = await req.json();
  const result = validate(permissionSchema, body);
  if (!result.success) return result.response;
  return { artist: authResult, ...result.data };
};

export default validatePermissionBody;
