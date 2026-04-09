import type {
  Catalog_Admins_t,
  InProcess_Admins_t,
  Sound_Admins_t,
} from '@/types/envio';

export function getScope(
  admin: InProcess_Admins_t | Catalog_Admins_t | Sound_Admins_t
): number {
  if ('permission' in admin) return admin.permission;
  if ('auth_scope' in admin) return admin.auth_scope;
  return admin.roles;
}
