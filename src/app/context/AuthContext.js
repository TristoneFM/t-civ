'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const defaultContext = {
  employeeId: null,
  permissions: [],
  login: async () => ({ success: false, error: 'Not initialized' }),
  logout: () => {},
  isAuthenticated: false,
  loginError: '',
  hasPermission: () => false,
  canAccessRoute: () => false,
  employeeName: '',
  currentShift: null
};

const AuthContext = createContext(defaultContext);

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  '/dashboard': ['admin', 'supervisor'],
  '/dashboard/reportes': ['admin', 'supervisor'],
  '/dashboard/defectos': ['admin', 'supervisor'],
  '/graficas': [] // No restrictions for graficas
};

export function AuthProvider({ children }) {
  const [employeeId, setEmployeeId] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [currentShift, setCurrentShift] = useState(null);
  const router = useRouter();

  // Function to determine shift based on time
  const determineShift = (hours, minutes) => {
    const currentTime = hours * 60 + minutes; // Convert to minutes for easier comparison
    
    // Shift A: 5:55 AM to 3:30 PM
    const shiftAStart = 5 * 60 + 55; // 5:55 AM in minutes
    const shiftAEnd = 15 * 60 + 30;  // 3:30 PM in minutes
    
    return currentTime >= shiftAStart && currentTime < shiftAEnd ? 'A' : 'B';
  };

  // Function to fetch server time and update shift
  const updateShift = async () => {
    try {
      const response = await fetch('/api/time');
      if (!response.ok) {
        throw new Error('Failed to fetch server time');
      }
      const data = await response.json();
      const shift = determineShift(data.hours, data.minutes);
      setCurrentShift(shift);
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for employee ID in cookies on mount
    const storedEmployeeId = Cookies.get('employeeId');
    const storedPermissions = Cookies.get('permissions');
    
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions);
          setPermissions(Array.isArray(parsedPermissions) ? parsedPermissions : []);
        } catch (e) {
          console.error('Error parsing permissions:', e);
          setPermissions([]);
        }
      }
    }
    setIsLoading(false);

    // Initial shift update
    updateShift();

    // Update shift every minute
    const interval = setInterval(updateShift, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = async (id, isAdmin = false) => {
    try {
      setLoginError('');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId: id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Add inspector permission if not admin
      const userPermissions = isAdmin ? data.permissions : [...data.permissions, 'inspector'];
      
      // Store employee ID and permissions in cookies
      if (typeof window !== 'undefined') {
        Cookies.set('employeeId', data.employeeId, { expires: 1 }); // Expires in 1 day
        Cookies.set('permissions', JSON.stringify(userPermissions), { expires: 1 });
        Cookies.set('employeeName', data.employeeName, { expires: 1 });
      }
      
      setEmployeeId(data.employeeId);
      setPermissions(userPermissions);
      setEmployeeName(data.employeeName);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Error during login');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      Cookies.remove('employeeId');
      Cookies.remove('permissions');
      Cookies.remove('employeeName');
    }
    setEmployeeId(null);
    setPermissions([]);
    setEmployeeName('');
    router.push('/login');
  };

  const isAuthenticated = !!employeeId;
  
  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const canAccessRoute = (path) => {
    // If the route is not in PROTECTED_ROUTES, allow access
    if (!PROTECTED_ROUTES[path]) return true;

    // If the route has no required permissions, allow access
    if (PROTECTED_ROUTES[path].length === 0) return true;

    // Check if user has any of the required permissions
    return PROTECTED_ROUTES[path].some(permission => hasPermission(permission));
  };

  // Redirect to login if not authenticated and not already on login page or graficas page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && 
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' && 
        !window.location.pathname.startsWith('/graficas')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check route access and redirect if necessary
  useEffect(() => {
    if (!isLoading && isAuthenticated && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // If user can't access the current route, redirect to appropriate page
      if (!canAccessRoute(currentPath)) {
        if (hasPermission('inspector')) {
          router.push('/login'); // Redirect inspectors to graficas
        } else {
          router.push('/dashboard'); // Redirect others to dashboard
        }
      }
    }
  }, [isLoading, isAuthenticated, permissions]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  const value = {
    employeeId,
    permissions,
    login,
    logout,
    isAuthenticated,
    loginError,
    hasPermission,
    canAccessRoute,
    employeeName,
    currentShift
  };

  return (
    <AuthContext.Provider value={value}>
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