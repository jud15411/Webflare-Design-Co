import { useState } from 'react';
import CompanyInfoSubpage from './Company/CompanyInfoSubpage';
import ServicesManagementSubpage from './Company/ServicesManagementSubpage';
import PricingBillingSubpage from './Billing/PricingBillingSubpage';
import InvoicesPaymentsSubpage from './Billing/InvoicesPaymentsSubpage';
import ClientPortalSubpage from './Client-Portal/ClientPortalSubpage';
import RoleBasedPermissionsSubpage from './Users/RoleBasedPermissionsSubpage';
import MFAEnforcementSubpage from './Users/MFAEnforcementSubpage';
import StandardAgreementsSubpage from './Legal/StandardAgreementsSubpage';
import AuditLogsSubpage from './System/AuditLogsSubpage';
import APIKeysIntegrationsSubpage from './System/APIKeysIntegrationsSubpage';
import BackupRestoreSubpage from './System/BackupRestoreSubpage';
import DataRetentionSubpage from './System/DataRetentionSubpage';
import QuizManagementSubpage from './Website/QuizManagementSubpage';
import './Settings.css';

// Type to define which subpage is active
type ActivePage =
  | 'main'
  | 'companyInfo'
  | 'services'
  | 'pricingBilling'
  | 'invoicesPayments'
  | 'clientPortal'
  | 'permissions'
  | 'mfa'
  | 'agreements'
  | 'auditLogs'
  | 'apiKeys'
  | 'backupRestore'
  | 'dataRetention'
  | 'quizManagement';

const CEOSettingsPage = () => {
  const [activePage, setActivePage] = useState<ActivePage>('main');

  // If a subpage is active, render it. Otherwise, render the main settings grid.
  if (activePage !== 'main') {
    // This switch makes the component rendering logic much cleaner and more direct
    switch (activePage) {
      case 'companyInfo':
        return <CompanyInfoSubpage onBack={() => setActivePage('main')} />;
      case 'services':
        return (
          <ServicesManagementSubpage onBack={() => setActivePage('main')} />
        );
      case 'pricingBilling':
        return <PricingBillingSubpage onBack={() => setActivePage('main')} />;
      case 'invoicesPayments':
        return <InvoicesPaymentsSubpage onBack={() => setActivePage('main')} />;
      case 'clientPortal':
        return <ClientPortalSubpage onBack={() => setActivePage('main')} />;
      case 'permissions':
        return (
          <RoleBasedPermissionsSubpage onBack={() => setActivePage('main')} />
        );
      case 'mfa':
        return <MFAEnforcementSubpage onBack={() => setActivePage('main')} />;
      case 'agreements':
        return (
          <StandardAgreementsSubpage onBack={() => setActivePage('main')} />
        );
      case 'auditLogs':
        return <AuditLogsSubpage onBack={() => setActivePage('main')} />;
      case 'apiKeys':
        return (
          <APIKeysIntegrationsSubpage onBack={() => setActivePage('main')} />
        );
      case 'backupRestore':
        return <BackupRestoreSubpage onBack={() => setActivePage('main')} />;
      case 'dataRetention':
        return <DataRetentionSubpage onBack={() => setActivePage('main')} />;
      case 'quizManagement':
        return <QuizManagementSubpage onBack={() => setActivePage('main')} />;
      default:
        // Fallback to main page if state is invalid
        setActivePage('main');
        return null;
    }
  }

  // Render the main settings page if no subpage is selected
  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>CEO Settings Dashboard</h1>
        <p>Manage all company-wide settings and administrative controls.</p>
      </header>
      <main className="settings-main">
        <section className="settings-section">
          <h2>Company & Services</h2>
          <div className="settings-card-grid">
            <div
              className="settings-card"
              onClick={() => setActivePage('companyInfo')}>
              <h3>Company Information</h3>
              <p>Manage company name, address, and contact details.</p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('services')}>
              <h3>Services Management</h3>
              <p>Add, remove, and edit the services your company offers.</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Billing & Payments</h2>
          <div className="settings-card-grid">
            <div
              className="settings-card"
              onClick={() => setActivePage('pricingBilling')}>
              <h3>Pricing & Billing Settings</h3>
              <p>Configure pricing models and billing cycles for services.</p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('invoicesPayments')}>
              <h3>Invoices & Payments</h3>
              <p>
                Manage invoice templates, payment rules, and connect payment
                providers.
              </p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('clientPortal')}>
              <h3>Client Portal Management</h3>
              <p>Control what clients can see and do in their portal.</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>User & Access Management</h2>
          <div className="settings-card-grid">
            <div
              className="settings-card"
              onClick={() => setActivePage('permissions')}>
              <h3>Role-Based Permissions</h3>
              <p>Set fine-grained access controls for all staff features.</p>
            </div>
            <div className="settings-card" onClick={() => setActivePage('mfa')}>
              <h3>MFA Enforcement</h3>
              <p>Manage multi-factor authentication policies for all users.</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Legal & Agreements</h2>
          <div className="settings-card-grid">
            <div
              className="settings-card"
              onClick={() => setActivePage('agreements')}>
              <h3>Standard Agreements</h3>
              <p>
                Manage standard contracts and agreements for new clients and
                services.
              </p>
            </div>
          </div>
        </section>
        
        <section className="settings-section">
          <h2>Website Content</h2>
          <div className="settings-card-grid">
            {/* ... other cards */}
            <div
              className="settings-card"
              onClick={() => setActivePage('quizManagement')}>
              <h3>Cybersecurity Quiz</h3>
              <p>Manage the interactive cybersecurity quiz on your website.</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>System & Security</h2>
          <div className="settings-card-grid">
            <div
              className="settings-card"
              onClick={() => setActivePage('auditLogs')}>
              <h3>Audit Logs</h3>
              <p>Review a log of all system actions and changes.</p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('apiKeys')}>
              <h3>API Keys & Integrations</h3>
              <p>Manage API keys for third-party integrations.</p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('backupRestore')}>
              <h3>Backup & Restore</h3>
              <p>Schedule system backups and manage restore points.</p>
            </div>
            <div
              className="settings-card"
              onClick={() => setActivePage('dataRetention')}>
              <h3>Data Retention</h3>
              <p>Define policies for how long to keep client data.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CEOSettingsPage;
