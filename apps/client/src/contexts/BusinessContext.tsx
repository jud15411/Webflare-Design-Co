import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// --- Type Definitions ---
interface BusinessSettings {
  companyName: string;
  logoUrl: string;
  fullLogoUrl?: string | null;
}

interface BusinessContextType {
  settings: BusinessSettings;
  isLoading: boolean; // Add loading state
  fetchBusinessSettings: () => Promise<void>;
}

// --- Context Creation ---
export const BusinessContext = createContext<BusinessContextType | null>(null);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

// --- Provider Component ---
interface BusinessProviderProps {
  children: React.ReactNode;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<BusinessSettings>({
    companyName: 'Firmaplex',
    logoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchBusinessSettings = async () => {
    try {
      setIsLoading(true);
      // NOTE: Your backend will need a public endpoint for this
      const { data } = await axios.get(`${API_URL}/api/v1/settings/public`);
      setSettings({
        ...data,
        fullLogoUrl: data.logoUrl ? `${API_URL}${data.logoUrl}` : null,
      });
    } catch (error) {
      console.error('Could not fetch business settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  const value = { settings, isLoading, fetchBusinessSettings };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};
