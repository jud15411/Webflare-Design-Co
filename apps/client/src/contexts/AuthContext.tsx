import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { jwtDecode } from 'jwt-decode';

// --- Type Definitions ---

// ✅ CORRECTED: This now correctly reflects your lowercase database roles.
interface Role {
  _id: string;
  name: 'ceo' | 'developer' | 'cto' | 'sales';
}

// ✅ CORRECTED: Update the User interface to use the Role type
export interface User {
  id: string;
  role: Role; // 'role' is an object
  name: string;
  email: string;
  bio?: string;
  location?: string;
}

interface LoginData {
  token: string;
  user?: User;
}

// ✅ CORRECTED: The JWT payload should also contain the populated role
interface DecodedToken {
  id: string;
  role: Role; // The token itself should contain the role object
  name: string;
  email: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => void;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>;
}

// --- Context Creation ---
export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Helper Functions ---
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const getUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
    };
  } catch {
    return null;
  }
};

// --- Auth Provider Component ---
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
          setUser(getUserFromToken(storedToken));
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!token) return;
    const checkTokenExpiration = () => {
      if (isTokenExpired(token)) {
        logout();
      }
    };
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const login = useCallback((loginData: LoginData) => {
    try {
      const { token: newToken, user: backendUser } = loginData;
      const userData = backendUser || getUserFromToken(newToken);
      if (!userData) {
        throw new Error('Invalid token or user data');
      }
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
