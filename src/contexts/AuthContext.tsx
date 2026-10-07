import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

export type UserRole = 'user' | 'admin';

export interface TeamInfo {
  name: string;
  totalPlayers: number;
  injuryAlerts: number;
  marketValue: string;
  videosAnalyzed: number;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  clubId?: string | null;
  teamInfo?: TeamInfo;
  // Optional: present in some admin APIs, not required for auth
  playerCount?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string, teamName: string) => Promise<User>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await apiService.verifyToken();
          if (response.data && response.data.user) {
            setIsAuthenticated(true);
            setUser(response.data.user);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await apiService.login(email, password);
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Login failed');
    }

    const { token, user: userData } = response.data;
    
    // Store token
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  };

  const signup = async (email: string, password: string, name: string, teamName: string): Promise<User> => {
    const response = await apiService.signup(email, password, name, teamName);
    
    if (response.error || !response.data) {
      const errorMessage = response.error || 'Signup failed';
      console.error('Signup error response:', response);
      throw new Error(errorMessage);
    }

    const { token, user: userData } = response.data;
    
    // Store token
    localStorage.setItem('token', token);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    return userData;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, signup, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
