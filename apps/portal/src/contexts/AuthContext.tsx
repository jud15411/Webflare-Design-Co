import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';
import { jwtDecode } from 'jwt-decode'; // We'll need a library to decode the token

// Add this interface
interface ClientUser {
  id: string;
  clientName: string;
}

interface AuthContextType {
  token: string | null;
  clientUser: ClientUser | null; // Add clientUser state
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('portal_token')
  );
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);

  useEffect(() => {
    if (token) {
      // Decode token to get user info when app loads
      const decoded: { id: string; clientName: string } = jwtDecode(token);
      setClientUser({ id: decoded.id, clientName: decoded.clientName });
    }
  }, [token]);

  const login = (newToken: string) => {
    const decoded: { id: string; clientName: string } = jwtDecode(newToken);
    setClientUser({ id: decoded.id, clientName: decoded.clientName });
    setToken(newToken);
    localStorage.setItem('portal_token', newToken);
  };

  const logout = () => {
    setToken(null);
    setClientUser(null);
    localStorage.removeItem('portal_token');
  };

  return (
    <AuthContext.Provider value={{ token, clientUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
