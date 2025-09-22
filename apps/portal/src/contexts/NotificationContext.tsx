import React, { createContext, useState, useContext, useCallback } from 'react';

interface NotificationContextType {
  showNotification: (message: string) => void;
}

interface NotificationState {
  message: string;
  isVisible: boolean;
}

// This context is for the function to trigger the notification
export const NotificationContext =
  createContext<NotificationContextType | null>(null);

// This context is for the component to read the state
export const NotificationStateContext = createContext<NotificationState>({
  message: '',
  isVisible: false,
});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationState>({
    message: '',
    isVisible: false,
  });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showNotification = useCallback(
    (message: string) => {
      // If a notification is already showing, clear its timer
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      setNotification({ message, isVisible: true });

      // Set a timer to hide the notification after 5 seconds
      const newTimeoutId = setTimeout(() => {
        setNotification({ message: '', isVisible: false });
      }, 3000);

      setTimeoutId(newTimeoutId);
    },
    [timeoutId]
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <NotificationStateContext.Provider value={notification}>
        {children}
      </NotificationStateContext.Provider>
    </NotificationContext.Provider>
  );
};
