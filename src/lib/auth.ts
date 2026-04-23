export type UserRole = 'member' | 'trainer' | 'golf_trainer' | 'fc' | 'staff' | 'admin';
export type EmployeeLoginRole = 'trainer' | 'fc' | 'staff';

const ROLE_LABELS: Record<EmployeeLoginRole, string> = {
  trainer: '트레이너',
  fc: 'FC',
  staff: '스태프',
};

export function normalizeUserRole(rawRole: string | null | undefined): UserRole | null {
  if (!rawRole) return null;

  switch (rawRole.trim().toLowerCase()) {
    case 'member':
      return 'member';
    case 'trainer':
      return 'trainer';
    case 'golf_trainer':
    case 'golf-trainer':
      return 'golf_trainer';
    case 'fc':
      return 'fc';
    case 'staff':
    case 'front':
    case 'frontdesk':
    case 'front_desk':
      return 'staff';
    case 'admin':
    case 'owner':
    case 'super_admin':
    case 'superadmin':
    case 'manager':
      return 'admin';
    default:
      return null;
  }
}

export function isTrainerRole(role: UserRole | null | undefined): role is 'trainer' | 'golf_trainer' | 'admin' {
  return role === 'trainer' || role === 'golf_trainer' || role === 'admin';
}

export function isEmployeeRole(role: UserRole | null | undefined): role is Exclude<UserRole, 'member'> {
  return role === 'trainer'
    || role === 'golf_trainer'
    || role === 'fc'
    || role === 'staff'
    || role === 'admin';
}

export function getRoleHomePath(role: UserRole | null | undefined) {
  switch (role) {
    case 'member':
      return '/';
    case 'fc':
      return '/fc';
    case 'staff':
      return '/staff';
    case 'trainer':
    case 'golf_trainer':
    case 'admin':
      return '/trainer';
    default:
      return '/login';
  }
}

export function getEmployeeRoleLabel(role: EmployeeLoginRole) {
  return ROLE_LABELS[role];
}

export function matchesEmployeeSelection(selectedRole: EmployeeLoginRole, actualRole: UserRole | null | undefined) {
  if (selectedRole === 'trainer') {
    return isTrainerRole(actualRole);
  }

  return actualRole === selectedRole;
}
