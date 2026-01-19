'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    try {
      const userData = localStorage.getItem('user');
      
      if (!userData) {
        router.push('/user/pages/SignIn');
        return;
      }

      const user = JSON.parse(userData);
      
      // Check if user is admin
      if (user.isAdmin && user.role === 'admin') {
        setIsAuthorized(true);
      } else {
        // Not admin, redirect to user dashboard
        router.push('/user/pages/CreatorDashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/user/pages/SignIn');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#081028] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E100FF]"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}