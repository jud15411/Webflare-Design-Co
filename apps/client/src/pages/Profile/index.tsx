import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Make sure this path is correct
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth(); // Assuming setUser updates the user in your context

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When the component loads, pre-fill the form with the current user's data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Get the token from local storage or your auth context
      const token = localStorage.getItem('userToken'); // Or however you store it

      const response = await fetch('/api/v1/users/profile', {
        // Correct API endpoint
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the auth token
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const updatedUser = await response.json();

      // Update the user state in the global auth context
      if (setUser) {
        setUser(updatedUser);
      }

      setMessage('✅ Profile updated successfully!');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-form-wrapper">
        <h2>Profile Settings</h2>
        <p>Update your personal and account information.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Canton, NY"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself..."></textarea>
          </div>
          <button type="submit" className="save-button" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
