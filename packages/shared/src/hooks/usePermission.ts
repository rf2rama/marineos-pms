import { useAuthStore } from '../stores/authStore';
import { PermissionKey, PERMISSION_MATRIX } from '../types/permissions';

export function usePermission() {
  const activeRole = useAuthStore((state) => state.activeRole);

  const can = (permission: PermissionKey): boolean => {
    const allowedRoles = PERMISSION_MATRIX[permission];
    return allowedRoles ? allowedRoles.includes(activeRole) : false;
  };

  return { can, activeRole };
}
