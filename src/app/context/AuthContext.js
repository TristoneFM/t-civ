'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const defaultContext = {
  employeeId: null,
  permissions: [],
  login: async () => ({ success: false, error: 'Not initialized' }),
  logout: () => {},
  isAuthenticated: false,
  loginError: '',
  hasPermission: () => false,
  employeeName: '',
  currentShift: null
};

const AuthContext = createContext(defaultContext);

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

    // Check for employee ID in localStorage on mount
    const storedEmployeeId = localStorage.getItem('employeeId');
    const storedPermissions = localStorage.getItem('permissions');
    
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

  const login = async (id) => {
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
      
      // Store employee ID and permissions
      if (typeof window !== 'undefined') {
        localStorage.setItem('employeeId', data.employeeId);
        localStorage.setItem('permissions', JSON.stringify(data.permissions));
        localStorage.setItem('employeeName', data.employeeName);
      }
      
      setEmployeeId(data.employeeId);
      setPermissions(data.permissions);
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
      localStorage.removeItem('employeeId');
      localStorage.removeItem('permissions');
      localStorage.removeItem('employeeName');
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

  // Redirect to login if not authenticated and not already on login page or graficas page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && 
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' && 
        !window.location.pathname.startsWith('/graficas')) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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