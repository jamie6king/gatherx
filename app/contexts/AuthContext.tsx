import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
  userType: 'GUEST' | 'EVENT_MANAGER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; userType?: 'GUEST' | 'EVENT_MANAGER' }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, redirectUrl?: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Set the token cookie with proper attributes for middleware
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax; Secure`;

      router.push(redirectUrl || '/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string; userType?: 'GUEST' | 'EVENT_MANAGER' }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
      }

      const responseData = await response.json();
      setUser(responseData.user);
      setToken(responseData.token);
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));

      // Set the token cookie with proper attributes for middleware
      document.cookie = `token=${responseData.token}; path=/; max-age=604800; SameSite=Lax; Secure`;

      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API to clear the cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear local state
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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