import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';
import API from '../../utils/axios';
import { FaUser, FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';
// Assuming this utility file is now created
import { AVATAR_OPTIONS, BLANK_AVATAR_URL } from '../../utils/avatars'; 


// Helper function to get initials (re-used from Sidebar)
const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

// --- Avatar Selector Modal Component (Internal to ProfilePage) ---
interface AvatarSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string | null) => void;
    currentAvatarUrl: string | null | undefined;
}

const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentAvatarUrl,
}) => {
    if (!isOpen) return null;

    // Filter out the BLANK_AVATAR_URL since it's only a control value
    const selectedUrl = currentAvatarUrl === BLANK_AVATAR_URL ? null : currentAvatarUrl;

    return (
        <div className="avatar-modal-overlay" onClick={onClose}>
            <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>
                    <FaTimes />
                </button>
                <h2>Choose Your Avatar</h2>
                <p>Select a fun, professional avatar to represent you in the dashboard.</p>
                
                <div className="avatar-selection-grid">
                    {/* Option to clear avatar and revert to initials */}
                    <div 
                        className={`avatar-option avatar-clear ${selectedUrl === null ? 'selected' : ''}`}
                        onClick={() => onSelect(null)}
                    >
                        <FaUser className="blank-avatar-icon" />
                        <span className="clear-label">Use Initials</span>
                    </div>

                    {AVATAR_OPTIONS.map(avatar => (
                        <div
                            key={avatar.id}
                            className={`avatar-option ${selectedUrl === avatar.url ? 'selected' : ''}`}
                            onClick={() => onSelect(avatar.url)}
                            title={avatar.alt}
                        >
                            <img 
                                src={avatar.url} 
                                alt={avatar.alt} 
                                className="avatar-image" 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Profile Page Component ---
export const ProfilePage: React.FC = () => {
  // FIX: Destructure token to use in API calls
  const { user, setUser, token } = useAuth(); 

  // State for profile information
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    // NEW: Include avatarUrl in state
    avatarUrl: null as string | null,
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false); // NEW: Modal state

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
        // Initialize state with user's current avatar URL
        avatarUrl: user.avatarUrl || null, 
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
  
  // Handle avatar selection from modal
  const handleAvatarSelect = (url: string | null) => {
    const newAvatarUrl = url === BLANK_AVATAR_URL ? null : url;
    setProfileData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    setIsAvatarModalOpen(false);
  };


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
        setProfileMessage('❌ Error: Not authenticated.');
        return;
    }
    
    setIsProfileLoading(true);
    setProfileMessage('');
    
    // Data now includes avatarUrl
    const updateData = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        avatarUrl: profileData.avatarUrl, 
    };

    try {
      // 2. Use token for authorization
      const { data: updatedUser } = await API.patch(
        '/users/profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      // Ensure setUser is available before calling it
      if (setUser) setUser(updatedUser); 
      setProfileMessage('✅ Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
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
    if (!token) {
        setPasswordMessage('❌ Error: Not authenticated.');
        return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match.');
      return;
    }
    setIsPasswordLoading(true);
    setPasswordMessage('');

    try {
      // 4. Use token for authorization
      await API.patch('/users/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
      { headers: { Authorization: `Bearer ${token}` } });

      setPasswordMessage('✅ Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }); // Clear fields
      setTimeout(() => setPasswordMessage(''), 3000);
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
  
  const currentAvatarUrl = profileData.avatarUrl;
    
  // Determine what to show in the Avatar circle
  const renderAvatarContent = () => {
    if (currentAvatarUrl) {
        return (
            <img 
                src={currentAvatarUrl} 
                alt={`${user?.name || 'User'}'s Avatar`} 
                className="profile-avatar-img"
            />
        );
    }
    // Fallback to initials if no URL is set
    return user?.name ? getInitials(user.name) : <FaUser />;
  };

  return (
    <div className="profile-page-container">
      <div className="profile-form-wrapper">
        <h2>Profile Settings</h2>
        <p>Update your personal and account information.</p>
        
        {/* --- NEW AVATAR SECTION --- */}
        <div className="avatar-management-section">
            <div className="avatar-display-wrapper">
                <div className="profile-avatar">
                    {renderAvatarContent()}
                </div>
                <button 
                    className="avatar-edit-button" 
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Change Avatar"
                >
                    <FaCamera />
                </button>
            </div>
        </div>

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
              // Email is often read-only for security reasons
              value={profileData.email}
              readOnly
              disabled
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
            {isProfileLoading ? (
                <>
                    <FaSpinner className="spinner" /> Saving...
                </>
            ) : 'Save Changes'}
          </button>
        </form>
        {profileMessage && <p className="form-message">{profileMessage}</p>}
      </div>

      {/* --- Password Change Form --- */}
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
      
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelect={handleAvatarSelect}
        currentAvatarUrl={currentAvatarUrl}
    />
    </div>
  );
};

export default ProfilePage;