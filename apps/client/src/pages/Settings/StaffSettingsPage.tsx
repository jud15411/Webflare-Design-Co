import React from 'react';
import './Settings.css';
import { type User } from '../../contexts/AuthContext';

interface StaffSettingsProps {
  user: User;
}

const StaffSettingsPage: React.FC<StaffSettingsProps> = ({ user }) => {
  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>My Settings</h1>
        <p>Manage your personal profile and account preferences.</p>
      </header>
      <main className="settings-main">
        <section className="settings-section">
          <h2>Profile & Personalization</h2>
          <div className="settings-card-grid">
            <div className="settings-card">
              <h3>Profile Information</h3>
              <p>Update your name, email, and contact details.</p>
              <div className="profile-info">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="settings-card">
              <h3>Theme Settings</h3>
              <p>Customize the look and feel of your dashboard.</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Security</h2>
          <div className="settings-card-grid">
            <div className="settings-card">
              <h3>Password & MFA</h3>
              <p>
                Change your password and manage multi-factor authentication.
              </p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Team Directory</h2>
          <div className="settings-card-grid">
            <div className="settings-card">
              <h3>Company Contacts</h3>
              <p>
                Find contact information for your team members based on their
                role.
              </p>
              {/* This is a placeholder for a feature that would fetch and display team data */}
              <p className="placeholder-info">
                This will show contact info for roles that are visible to you,
                as configured by the CEO.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffSettingsPage;
