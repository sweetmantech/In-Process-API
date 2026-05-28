import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { permissionSchema } from '@/lib/schema/permissionSchema';
import { addPermission } from '@/lib/moment/addPermission';
import { removePermission } from '@/lib/moment/removePermission';
import { Address } from 'viem';
import { validate } from '@/lib/schema/validate';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { primaryWallet } = authResult;

    const body = await req.json();
    const validationResult = validate(permissionSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const data = validationResult.data;
    const result = await addPermission({
      ...data,
      artistAddress: primaryWallet as Address,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error adding permission:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add permission' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) {
      return authResult;
    }
    const { primaryWallet } = authResult;

    const body = await req.json();
    const validationResult = validate(permissionSchema, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const data = validationResult.data;
    const result = await removePermission({
      ...data,
      artistAddress: primaryWallet as Address,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error removing permission:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to remove permission' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
