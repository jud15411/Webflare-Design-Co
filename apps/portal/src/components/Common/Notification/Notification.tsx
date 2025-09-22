import React, { useContext } from 'react';
import { NotificationStateContext } from '../../../contexts/NotificationContext';
import './Notification.css';

export const Notification: React.FC = () => {
  const { message, isVisible } = useContext(NotificationStateContext);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="notification-container">
      <div className="notification-content">
        <span className="notification-icon">✅</span>
        <p>{message}</p>
      </div>
    </div>
  );
};
