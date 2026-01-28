import { NextRequest, NextResponse } from 'next/server';
import getCorsHeader from '@/lib/getCorsHeader';
import { authMiddleware } from '@/authMiddleware';
import { permissionSchema } from '@/lib/schema/permissionSchema';
import { addPermission } from '@/lib/moment/addPermission';
import { removePermission } from '@/lib/moment/removePermission';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';

// CORS headers for allowing cross-origin requests
const corsHeaders = getCorsHeader();

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req, { corsHeaders });
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress } = authResult;

    const body = await req.json();
    const validationResult = validate(permissionSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const data = validationResult.data;
    const result = await addPermission({
      ...data,
      artistAddress: artistAddress as Address,
    });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error adding permission:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add permission' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req, { corsHeaders });
    if (authResult instanceof Response) {
      return authResult;
    }
    const { artistAddress } = authResult;

    const body = await req.json();
    const validationResult = validate(permissionSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const data = validationResult.data;
    const result = await removePermission({
      ...data,
      artistAddress: artistAddress as Address,
    });
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error removing permission:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove permission' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
