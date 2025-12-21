// src/config/permissions.js

const PERMISSIONS = {
  // A. Global System Permissions
  SYS_MANAGE_BRANCHES: 'sys_manage_branches',
  SYS_MANAGE_ROLES: 'sys_manage_roles',
  SYS_MANAGE_USERS: 'sys_manage_users',
  SYS_VIEW_AUDIT_ALL: 'sys_view_audit_all',
  SYS_CONFIG_MFA: 'sys_config_mfa',
  SYS_EXPORT_DATA: 'sys_export_data',

  // Admin-only Client Management
  SYS_MANAGE_CLIENTS: 'sys_manage_clients',
  SYS_VIEW_CLIENT_FINANCIALS: 'sys_view_client_financials',

  // B. General Registry (The "Entrance" permission)
  GLOBAL_VIEW_CLIENT_REGISTRY: 'global_view_client_registry',

  // C. Web Development Branch Permissions
  WEB_VIEW_PROJECTS: 'web_view_projects',
  WEB_CREATE_PROJECT: 'web_create_project',
  WEB_MANAGE_CLIENTS: 'web_manage_clients',

  // D. Cybersecurity Branch Permissions
  CYBER_VIEW_VULNS: 'cyber_view_vulns',
  CYBER_RUN_SCANS: 'cyber_run_scans',
  CYBER_MANAGE_CLIENTS: 'cyber_manage_clients', // <--- ADDED THIS
  CYBER_MANAGE_INCIDENTS: 'cyber_manage_incidents',
  CYBER_ACCESS_VAULT: 'cyber_access_vault',

  // Wildcard for SuperAdmin
  SUPER_ADMIN: '*',
};

module.exports = PERMISSIONS;
