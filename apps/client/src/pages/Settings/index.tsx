import { useAuth } from '../../contexts/AuthContext';
import CEOSettingsPage from './CEOSettingsPage';
import StaffSettingsPage from './StaffSettingsPage';
import './Settings.css';

const SettingsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please log in to view this page.</div>;
  }

  // Check the user's role and render the appropriate settings page
  if (user.role.name === 'ceo') {
    return <CEOSettingsPage />;
  } else {
    return <StaffSettingsPage user={user} />;
  }
};

export default SettingsPage;
