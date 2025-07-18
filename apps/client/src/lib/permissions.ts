import { getUserRole } from './auth';

export type Permission = 'create' | 'edit' | 'delete' | 'view';

export function hasPermission(permission: Permission): boolean {
  const userRole = getUserRole();
  
  switch (userRole) {
    case 'admin':
      return true; // Admins can do everything
    case 'editor':
      return permission !== 'delete'; // Editors can create, edit, view but not delete
    case 'viewer':
      return permission === 'view'; // Viewers can only view
    default:
      return false;
  }
}

export function canCreate(): boolean {
  return hasPermission('create');
}

export function canEdit(): boolean {
  return hasPermission('edit');
}

export function canDelete(): boolean {
  return hasPermission('delete');
}

export function canView(): boolean {
  return hasPermission('view');
}

// Specific permission checks for different features
export function canManageUsers(): boolean {
  return getUserRole() === 'admin';
}

export function canManageProviders(): boolean {
  return hasPermission('create') || hasPermission('edit');
}

export function canManageServices(): boolean {
  return hasPermission('create') || hasPermission('edit');
}

export function canManageIntegrations(): boolean {
  return hasPermission('create') || hasPermission('edit');
}

export function canManageTags(): boolean {
  return hasPermission('create') || hasPermission('edit');
} 