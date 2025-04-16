import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/auth/session`, {
        credentials: 'include' // Importante para enviar las cookies
      });
      
      if (!response.ok) {
        throw new Error('Error al verificar la sesión');
      }

      const data = await response.json();
      
      if (!data.user) {
        window.location.href = '/login';
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking authentication:', error);
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 