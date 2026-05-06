import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/arweave/turboClient', () => ({
  default: { signer: { getNativeAddress: vi.fn() } },
}));

import turboClient from '@/lib/arweave/turboClient';
import verifyArweaveTx from '@/lib/arweave/verifyArweaveTx';

const ourAddress = '0xourwallet';
const txId = 'abc123txid';
const arweave_uri = `ar://${txId}`;

const makeGqlResponse = (address: string | null) => ({
  ok: true,
  json: async () => ({
    data: {
      transactions: {
        edges: address ? [{ node: { id: txId, address } }] : [],
      },
    },
  }),
});

describe('verifyArweaveTx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(turboClient.signer.getNativeAddress).mockResolvedValue(
      ourAddress
    );
  });

  it('returns true when tx address matches our wallet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeGqlResponse(ourAddress))
    );

    const result = await verifyArweaveTx(arweave_uri);

    expect(result).toBe(true);
  });

  it('returns false when tx address does not match our wallet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeGqlResponse('0xother'))
    );

    const result = await verifyArweaveTx(arweave_uri);

    expect(result).toBe(false);
  });

  it('returns false when no transaction is found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeGqlResponse(null)));

    const result = await verifyArweaveTx(arweave_uri);

    expect(result).toBe(false);
  });

  it('compares addresses case-insensitively', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeGqlResponse(ourAddress.toUpperCase()))
    );

    const result = await verifyArweaveTx(arweave_uri);

    expect(result).toBe(true);
  });

  it('throws when graphql returns a non-ok status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(verifyArweaveTx(arweave_uri)).rejects.toThrow(
      'Irys graphql returned 500'
    );
  });

  it('calls getNativeAddress to resolve our wallet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeGqlResponse(ourAddress))
    );

    await verifyArweaveTx(arweave_uri);

    expect(turboClient.signer.getNativeAddress).toHaveBeenCalledOnce();
  });

  it('strips ar:// prefix when querying graphql', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeGqlResponse(ourAddress));
    vi.stubGlobal('fetch', fetchMock);

    await verifyArweaveTx(arweave_uri);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.query).toContain(`"${txId}"`);
    expect(body.query).not.toContain('ar://');
  });
});
