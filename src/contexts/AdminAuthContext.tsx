import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, API_ENDPOINTS } from '@/lib/api';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: {
    users: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    freelancers: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    jobs: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    analytics: {
      view: boolean;
    };
  };
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      console.log('Checking admin authentication...');
      const response = await api.get(API_ENDPOINTS.ADMIN_AUTH.ME);
      const data = response.data;

      console.log('Auth check response:', data);

      if (data.success) {
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        console.log('Admin authenticated');
      } else {
        setAdmin(null);
        localStorage.removeItem('admin');
        console.log('Admin not authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAdmin(null);
      localStorage.removeItem('admin');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login for:', email);
      const response = await api.post(API_ENDPOINTS.ADMIN_AUTH.LOGIN, { email, password });
      const data = response.data;

      console.log('Login response:', data);

      if (data.success) {
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        console.log('Admin login successful');
        return true;
      } else {
        console.log('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.ADMIN_AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      localStorage.removeItem('admin');
    }
  };

  useEffect(() => {
    // Check if admin is stored in localStorage first
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
    
    // Then verify with server
    checkAuth();
  }, []);

  const value = {
    admin,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
