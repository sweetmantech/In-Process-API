import { NextRequest, NextResponse } from 'next/server';
import { addPermission } from '@/lib/moment/addPermission';
import { removePermission } from '@/lib/moment/removePermission';
import validatePermissionBody from '@/lib/moment/validatePermissionBody';

export async function POST(req: NextRequest) {
  try {
    const validated = await validatePermissionBody(req);
    if (validated instanceof NextResponse) return validated;
    return NextResponse.json(await addPermission(validated));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to add permission' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validated = await validatePermissionBody(req);
    if (validated instanceof NextResponse) return validated;
    return NextResponse.json(await removePermission(validated));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to remove permission' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
