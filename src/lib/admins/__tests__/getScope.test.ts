import { describe, it, expect } from 'vitest';
import { getScope } from '../getScope';
import type {
  InProcess_Admins_t,
  Catalog_Admins_t,
  Sound_Admins_t,
  ZoraMedia_Admins_t,
} from '@/types/envio';

describe('getScope', () => {
  it('returns permission for InProcess_Admins_t', () => {
    const admin = {
      id: '1',
      admin: '0xabc',
      collection: '0xcol',
      token_id: '1',
      chain_id: 8453,
      permission: 3,
      updated_at: 1000,
    } satisfies InProcess_Admins_t;
    expect(getScope(admin)).toBe(3);
  });

  it('returns auth_scope for Catalog_Admins_t', () => {
    const admin = {
      id: '2',
      admin: '0xabc',
      collection: '0xcol',
      token_id: '1',
      chain_id: 8453,
      auth_scope: 2,
      updated_at: 1000,
    } satisfies Catalog_Admins_t;
    expect(getScope(admin)).toBe(2);
  });

  it('returns roles for Sound_Admins_t', () => {
    const admin = {
      id: '3',
      collection: '0xcol',
      token_id: '1',
      admin: '0xabc',
      roles: 5,
      chain_id: 8453,
      updated_at: 1000,
    } satisfies Sound_Admins_t;
    expect(getScope(admin)).toBe(5);
  });

  it('returns 1 for ZoraMedia_Admins_t (presence means active)', () => {
    const admin = {
      id: '5',
      admin: '0xabc',
      collection: '0xcol',
      token_id: '1',
      chain_id: 8453,
      updated_at: 1000,
    } satisfies ZoraMedia_Admins_t;
    expect(getScope(admin)).toBe(1);
  });

  it('returns 0 scope for revoked InProcess admin', () => {
    const admin = {
      id: '4',
      admin: '0xabc',
      collection: '0xcol',
      token_id: '1',
      chain_id: 8453,
      permission: 0,
      updated_at: 1000,
    } satisfies InProcess_Admins_t;
    expect(getScope(admin)).toBe(0);
  });
});
