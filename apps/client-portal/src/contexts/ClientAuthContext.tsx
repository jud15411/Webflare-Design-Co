import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import API from '../utils/axios';

export enum ClientLoginStatus {
  IDLE = 'IDLE',
  FIRST_TIME = 'FIRST_TIME',
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  AUTHENTICATED = 'AUTHENTICATED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  ERROR = 'ERROR',
}

type ClientUser = {
  _id: string;
  email: string;
  client: string;
  clientName?: string;
};

interface ClientAuthContextValue {
  token: string | null;
  user: ClientUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  status: ClientLoginStatus;
  checkStatus: (email: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined);

interface Props { children: ReactNode }

export const ClientAuthProvider: React.FC<Props> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ClientLoginStatus>(ClientLoginStatus.IDLE);
  const [emailForFlow, setEmailForFlow] = useState<string | null>(null);

  useEffect(() => {
    // Check for token in both locations for backward compatibility
    const stored = localStorage.getItem('authToken') || localStorage.getItem('clientToken');
    const storedUser = localStorage.getItem('clientUser');
    if (stored && storedUser) {
      // If we found a token in the old location, migrate it to the new one
      if (localStorage.getItem('clientToken') && !localStorage.getItem('authToken')) {
        localStorage.setItem('authToken', stored);
      }
      setToken(stored);
      try { setUser(JSON.parse(storedUser) as ClientUser); } catch {}
      setStatus(ClientLoginStatus.AUTHENTICATED);
    }
  }, []);

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    // Remove both old and new token keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setToken(null);
    setUser(null);
    setStatus(ClientLoginStatus.IDLE);
  };

  const checkStatus = async (email: string) => {
    setLoading(true);
    try {
      const { data } = await API.post('/client-auth/status', { email });
      setEmailForFlow(email);
      if (data.status === 'FIRST_TIME') {
        setUser(data.user as ClientUser);
        setStatus(ClientLoginStatus.FIRST_TIME);
      } else if (data.status === 'PASSWORD_REQUIRED') {
        setUser(data.user as ClientUser);
        setStatus(ClientLoginStatus.PASSWORD_REQUIRED);
      } else {
        setStatus(ClientLoginStatus.ERROR);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) setStatus(ClientLoginStatus.NOT_FOUND);
      else if (err?.response?.status === 403) setStatus(ClientLoginStatus.ACCESS_DENIED);
      else setStatus(ClientLoginStatus.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const setPassword = async (password: string) => {
    if (!emailForFlow) return;
    setLoading(true);
    try {
      const { data } = await API.post('/client-auth/set-password', { email: emailForFlow, password });
      const u: ClientUser = {
        _id: data._id,
        email: data.email,
        client: data.client,
        clientName: data.clientName,
      };
      setUser(u);
      setToken(data.token);
      // Store token with the correct key
      localStorage.setItem('authToken', data.token);
      // For backward compatibility, also store with the old key
      localStorage.setItem('clientToken', data.token);
      localStorage.setItem('clientUser', JSON.stringify(u));
      setStatus(ClientLoginStatus.AUTHENTICATED);
    } catch (err) {
      setStatus(ClientLoginStatus.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await API.post('/client-auth/login', { email, password });
      const u: ClientUser = {
        _id: data._id,
        email: data.email,
        client: data.client,
        clientName: data.clientName,
      };
      setUser(u);
      setToken(data.token);
      // Store token with the correct key
      localStorage.setItem('authToken', data.token);
      // For backward compatibility, also store with the old key
      localStorage.setItem('clientToken', data.token);
      localStorage.setItem('clientUser', JSON.stringify(u));
      setStatus(ClientLoginStatus.AUTHENTICATED);
    } catch (err: any) {
      if (err?.response?.status === 403 && err?.response?.data?.message === 'FIRST_TIME') {
        setStatus(ClientLoginStatus.FIRST_TIME);
      } else if (err?.response?.status === 403) {
        setStatus(ClientLoginStatus.ACCESS_DENIED);
      } else if (err?.response?.status === 401) {
        setStatus(ClientLoginStatus.ERROR);
      } else {
        setStatus(ClientLoginStatus.ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const value: ClientAuthContextValue = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    loading,
    status,
    checkStatus,
    setPassword,
    login,
    logout,
  }), [token, user, isAuthenticated, loading, status]);

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error('useClientAuth must be used within a ClientAuthProvider');
  return ctx;
};