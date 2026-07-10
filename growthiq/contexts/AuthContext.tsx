'use client';
import { createContext, useContext, useState, useEffect } from 'react';

let base = process.env.NEXT_PUBLIC_API_URL;
if (base) {
  if (!base.endsWith('/api/v1')) {
    base = base.replace(/\/$/, '') + '/api/v1';
  }
}
const API_BASE_URL = base || (typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8000/api/v1`
  : 'http://127.0.0.1:8000/api/v1');

interface BusinessData {
  business_name: string;
  industry: string;
  city?: string;
  state?: string;
  monthly_revenue: number;
  monthly_expenses: number;
  monthly_customers: number;
  avg_order_value: number;
  growth_rate: number;
  profit_margin: number;
  online_presence: string;
  employee_count?: number;
  years_in_business?: number;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  role: string;
  created_at?: string;
  businessData?: BusinessData;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<AuthUser>;
  logout: () => void;
  saveBusinessData: (data: BusinessData) => Promise<void>;
  fetchWithAuth: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to perform authenticated fetch requests
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('growthiq_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'API request failed');
    }

    // Handle file downloads (like PDFs) differently
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return res.blob();
    }

    return res.json();
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('growthiq_token');
      if (token) {
        try {
          // Fetch latest user details from backend
          const userData = await fetchWithAuth('/auth/me');
          
          // Try to fetch business data too
          let businessData;
          try {
            businessData = await fetchWithAuth('/business');
          } catch (e) {
            // It is fine if there is no business data yet
          }

          setUser({
            ...userData,
            businessData,
          });
        } catch (e) {
          console.error('Session restore failed:', e);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('growthiq_token', data.access_token);
    
    // Try to load business data
    let businessData;
    try {
      businessData = await fetchWithAuth('/business');
    } catch (e) {
      // ignore missing business data or token issues until after login
    }

    const authUser: AuthUser = {
      ...data.user,
      businessData,
    };

    setUser(authUser);
    return authUser;
  };

  const register = async (email: string, password: string, name: string, role: string = 'user') => {
    const data = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });

    localStorage.setItem('growthiq_token', data.access_token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential: string): Promise<AuthUser> => {
    const data = await fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    localStorage.setItem('growthiq_token', data.access_token);
    
    let businessData;
    try {
      businessData = await fetchWithAuth('/business');
    } catch (e) {
      // ignore
    }

    const authUser: AuthUser = {
      ...data.user,
      businessData,
    };

    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('growthiq_token');
  };

  const saveBusinessData = async (data: BusinessData) => {
    if (!user) return;
    const resData = await fetchWithAuth('/business', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setUser((prev) => prev ? { ...prev, businessData: resData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout, saveBusinessData, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
