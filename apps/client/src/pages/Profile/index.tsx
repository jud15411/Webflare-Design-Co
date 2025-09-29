import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';
import API from '../../utils/axios'; // 1. Import the centralized API instance

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();

  // State for profile information
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage('');

    try {
      // 2. Replace fetch with API.patch
      const { data: updatedUser } = await API.patch(
        '/users/profile',
        profileData
      );

      if (setUser) setUser(updatedUser);
      setProfileMessage('✅ Profile updated successfully!');
    } catch (error: any) {
      // 3. Update error handling for Axios
      setProfileMessage(
        `❌ Error: ${
          error.response?.data?.message || 'Failed to update profile.'
        }`
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match.');
      return;
    }
    setIsPasswordLoading(true);
    setPasswordMessage('');

    try {
      // 4. Replace fetch with API.patch
      await API.patch('/users/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordMessage('✅ Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }); // Clear fields
    } catch (error: any) {
      // 5. Update error handling for Axios
      setPasswordMessage(
        `❌ Error: ${
          error.response?.data?.message || 'Failed to update password.'
        }`
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-form-wrapper">
        <h2>Profile Settings</h2>
        <p>Update your personal and account information.</p>
        <form onSubmit={handleProfileSubmit}>
          {/* Profile fields... */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleProfileChange}
              placeholder="e.g., Canton, NY"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={profileData.bio}
              onChange={handleProfileChange}
              placeholder="Tell us a little about yourself..."></textarea>
          </div>
          <button
            type="submit"
            className="save-button"
            disabled={isProfileLoading}>
            {isProfileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {profileMessage && <p className="form-message">{profileMessage}</p>}
      </div>

      {/* --- New Password Change Form --- */}
      <div className="profile-form-wrapper password-section">
        <h2>Change Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button
            type="submit"
            className="save-button"
            disabled={isPasswordLoading}>
            {isPasswordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {passwordMessage && <p className="form-message">{passwordMessage}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;