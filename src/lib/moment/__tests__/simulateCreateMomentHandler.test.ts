import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMomentSchema } from '@/lib/schema/createMomentSchema';
import simulateCreateMomentHandler from '../simulateCreateMomentHandler';

vi.mock('../simulateCreateMoment', () => ({
  simulateCreateMoment: vi.fn(),
}));

import { simulateCreateMoment } from '../simulateCreateMoment';

const SIM_RESULT = {
  contractSimulation: { success: true as const },
  userOperation: { userOpHash: '0xabc', status: 'ok' },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(simulateCreateMoment).mockResolvedValue(SIM_RESULT);
});

describe('simulateCreateMomentHandler', () => {
  it('returns JSON with the simulation result', async () => {
    const input = createMomentSchema.parse({
      contract: { name: 'T', uri: 'ar://c' },
      token: {
        tokenMetadataURI: 'ar://t',
        createReferral: '0x1111111111111111111111111111111111111111',
        salesConfig: {
          type: 'erc20Mint',
          pricePerToken: '1',
          saleStart: 1,
          saleEnd: '18446744073709551615',
          currency: '0x2222222222222222222222222222222222222222',
        },
        mintToCreatorCount: 1,
        payoutRecipient:
          '0x0000000000000000000000000000000000000123'.toLowerCase(),
      },
      account: '0x0000000000000000000000000000000000000123',
      channel: 'web',
    });

    const res = await simulateCreateMomentHandler(input);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(SIM_RESULT);
    expect(simulateCreateMoment).toHaveBeenCalledWith(input);
  });
});
