'use client';
import { useEffect, useState } from 'react';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders children if the current user is an admin
 * Usage: <AdminOnly><EditButton /></AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.isAdmin === true && user.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading spinner if preferred
  }

  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to check if current user is admin
 * Usage: const isAdmin = useIsAdmin();
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.isAdmin === true && user.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, []);

  return isAdmin;
}