export async function GET() {
  try {
    return new Response(
      JSON.stringify({
        envs: process.env,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get blob';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
