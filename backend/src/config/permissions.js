// src/config/permissions.js

const PERMISSIONS = {
  // A. Global System Permissions (Infrastructure)
  SYS_MANAGE_BRANCHES: 'sys_manage_branches',
  SYS_MANAGE_ROLES: 'sys_manage_roles',
  SYS_MANAGE_USERS: 'sys_manage_users',
  SYS_VIEW_AUDIT_ALL: 'sys_view_audit_all',
  SYS_CONFIG_MFA: 'sys_config_mfa',
  SYS_EXPORT_DATA: 'sys_export_data',

  // B. Web Development Branch Permissions
  WEB_VIEW_PROJECTS: 'web_view_projects',
  WEB_CREATE_PROJECT: 'web_create_project',
  WEB_DEPLOY_STAGING: 'web_deploy_staging',
  WEB_DEPLOY_PROD: 'web_deploy_prod',
  WEB_EDIT_ENV: 'web_edit_env',
  WEB_MANAGE_CLIENTS: 'web_manage_clients',
  WEB_MONITOR_UPTIME: 'web_monitor_uptime',
  WEB_PURGE_CACHE: 'web_purge_cache',

  // C. Cybersecurity Branch Permissions
  CYBER_VIEW_VULNS: 'cyber_view_vulns',
  CYBER_RUN_SCANS: 'cyber_run_scans',
  CYBER_MANAGE_INCIDENTS: 'cyber_manage_incidents',
  CYBER_VIEW_INTEL: 'cyber_view_intel',
  CYBER_EDIT_POLICIES: 'cyber_edit_policies',
  CYBER_VIEW_TRAFFIC: 'cyber_view_traffic',
  CYBER_APPROVE_REMEDIATION: 'cyber_approve_remediation',
  CYBER_ACCESS_VAULT: 'cyber_access_vault',

  // Wildcard for SuperAdmin
  SUPER_ADMIN: '*',
};

module.exports = PERMISSIONS;
