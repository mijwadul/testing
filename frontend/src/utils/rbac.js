/**
 * Role-Based Access Control (RBAC) Utilities - Bina-ERP System
 * PT. Kusuma Samudera Group
 * 
 * Roles:
 * - gm: General Manager (Super Admin) - Full access + Final Approval
 * - finance: Finance Staff - Financial data + Vendor + Payroll
 * - admin: Admin/HR - Equipment + Employee + Attendance
 * - field: Field Staff/Operator - Data entry only (Attendance, Fuel, Work Logs)
 */

// Role definitions - Bina-ERP
// Legacy roles: helper → field, checker → finance
export const ROLES = {
  GM: 'gm',           // General Manager - Super Admin
  FINANCE: 'finance', // Finance Staff (was: checker)
  ADMIN: 'admin',     // Admin/HR
  FIELD: 'field',     // Field Staff/Operator (was: helper)
  // Legacy roles for backward compatibility
  HELPER: 'helper',   // Legacy - maps to field
  CHECKER: 'checker'  // Legacy - maps to finance
};

// Role metadata for UI display - Bina-ERP
export const ROLE_METADATA = {
  [ROLES.GM]: {
    label: 'General Manager',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Crown',
    description: 'Full access + Final approval finansial'
  },
  [ROLES.FINANCE]: {
    label: 'Finance Staff',
    color: 'bg-green-100 text-green-800',
    icon: 'DollarSign',
    description: 'Keuangan, Vendor, Payroll, Harga'
  },
  [ROLES.ADMIN]: {
    label: 'Admin/HR',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Users',
    description: 'Equipment, Karyawan, Absensi'
  },
  [ROLES.FIELD]: {
    label: 'Field Staff',
    color: 'bg-amber-100 text-amber-800',
    icon: 'HardHat',
    description: 'Input lapangan: Absen, BBM, Work Logs'
  },
  // Legacy role metadata
  [ROLES.HELPER]: {
    label: 'Helper (Legacy)',
    color: 'bg-gray-100 text-gray-800',
    icon: 'HardHat',
    description: 'Legacy role - maps to Field Staff'
  },
  [ROLES.CHECKER]: {
    label: 'Checker (Legacy)',
    color: 'bg-gray-100 text-gray-800',
    icon: 'DollarSign',
    description: 'Legacy role - maps to Finance Staff'
  }
};

// Route access permissions - Bina-ERP Matrix
// Legacy: helper → field, checker → finance
export const ROUTE_PERMISSIONS = {
  // Common routes - All roles including legacy
  '/dashboard': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  '/equipment': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  '/projects': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  
  // Field Staff routes (field + helper legacy)
  '/fuel': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  '/work-logs': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  '/attendance': [ROLES.GM, ROLES.FINANCE, ROLES.ADMIN, ROLES.FIELD, ROLES.HELPER, ROLES.CHECKER],
  
  // Admin/HR routes
  '/employees': [ROLES.GM, ROLES.ADMIN],
  
  // Finance routes (GM + Finance + checker legacy)
  '/finance': [ROLES.GM, ROLES.FINANCE, ROLES.CHECKER],
  '/finance/fuel-price': [ROLES.GM, ROLES.FINANCE, ROLES.CHECKER],
  '/finance/rental-rates': [ROLES.GM, ROLES.FINANCE, ROLES.CHECKER],
  '/material-sales': [ROLES.GM, ROLES.FINANCE, ROLES.CHECKER],
  '/income': [ROLES.GM, ROLES.FINANCE, ROLES.CHECKER],
  
  // GM only routes (admin role also has GM access)
  '/users': [ROLES.GM, ROLES.ADMIN]
};

/**
 * Check if user has required role
 * @param {Object} user - Current user object with role property
 * @param {string|string[]} allowedRoles - Required role(s)
 * @returns {boolean}
 */
export const hasRole = (user, allowedRoles) => {
  if (!user) return false;
  
  // Superuser always has access
  if (user.is_superuser) return true;
  
  // GM and legacy admin always have access
  const adminRoles = [ROLES.GM, ROLES.ADMIN, 'admin'];
  if (adminRoles.includes(user.role) || user.is_admin) return true;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Check if user can access a specific route
 * @param {Object} user - Current user object
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const canAccessRoute = (user, path) => {
  if (!user) return false;
  
  // Superuser always has access
  if (user.is_superuser) return true;
  
  // GM and legacy admin always have access
  const adminRoles = [ROLES.GM, ROLES.ADMIN, 'admin'];
  if (adminRoles.includes(user.role) || user.is_admin) return true;
  
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; // No restrictions
  
  return allowedRoles.includes(user.role);
};

/**
 * Check if user is GM (General Manager)
 * Supports both 'gm' (Bina-ERP) and 'admin' (legacy) roles
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const isGM = (user) => {
  if (!user) return false;
  const adminRoles = [ROLES.GM, ROLES.ADMIN]; // Support both 'gm' and 'admin' roles
  return adminRoles.includes(user.role) || user.is_admin || user.is_superuser;
};

/**
 * Check if user is Finance Staff (or GM)
 * Legacy 'checker' role maps to finance
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const isFinance = (user) => {
  if (!user) return false;
  const financeRoles = [ROLES.FINANCE, ROLES.CHECKER]; // finance + legacy checker
  const adminRoles = [ROLES.GM, ROLES.ADMIN];
  return financeRoles.includes(user.role) || adminRoles.includes(user.role) || user.is_admin || user.is_superuser;
};

/**
 * Check if user is Admin/HR (or GM)
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  if (!user) return false;
  const adminRoles = [ROLES.ADMIN, ROLES.GM]; // Both 'admin' and 'gm' are admin level
  return adminRoles.includes(user.role) || user.is_admin || user.is_superuser;
};

/**
 * Check if user is Field Staff (or higher)
 * Legacy 'helper' role maps to field
 * @param {Object} user - Current user object
 * @returns {boolean}
 */
export const isField = (user) => {
  if (!user) return false;
  const fieldRoles = [ROLES.FIELD, ROLES.HELPER]; // field + legacy helper
  const allRoles = [...fieldRoles, ROLES.ADMIN, ROLES.FINANCE, ROLES.GM, ROLES.CHECKER];
  return allRoles.includes(user.role) || user.is_admin || user.is_superuser;
};

/**
 * Get role display metadata
 * @param {string} role - Role key
 * @returns {Object} Role metadata
 */
export const getRoleMetadata = (role) => {
  return ROLE_METADATA[role] || ROLE_METADATA[ROLES.FIELD];
};

/**
 * Filter menu items based on user role
 * @param {Array} menuItems - Array of menu items with 'roles' property
 * @param {Object} user - Current user object
 * @returns {Array} Filtered menu items
 */
export const filterMenuByRole = (menuItems, user) => {
  if (!user) return [];
  
  return menuItems.filter(item => {
    if (!item.roles) return true; // No restriction
    return hasRole(user, item.roles);
  });
};

/**
 * Hook untuk check permission (to be used in components)
 * @returns {Object} Permission utilities
 */
export const usePermissions = (user) => {
  return {
    isGM: isGM(user),
    isFinance: isFinance(user),
    isAdmin: isAdmin(user),
    isField: isField(user),
    hasRole: (roles) => hasRole(user, roles),
    canAccess: (path) => canAccessRoute(user, path)
  };
};
