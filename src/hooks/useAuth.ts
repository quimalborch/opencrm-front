import { useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const API_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const login = async (email: string, password: string) => {
    try {
      // Obtener el token CSRF
      const csrfResponse = await fetch(`${API_URL}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Error al obtener el token CSRF');
      }

      const { csrfToken } = await csrfResponse.json();
      
      const response = await fetch(`${API_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ 
          email, 
          password,
          csrfToken,
          callbackUrl: `${API_URL}/api/auth/session`, // Especificar URL de callback explícita
        }),
        redirect: 'follow', // Seguir redirecciones automáticamente
      });

      // Si la respuesta no es ok y no es una redirección, manejar el error
      if (!response.ok && response.status !== 302) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error en la autenticación');
      }

      // Verificar la sesión después del login
      const sessionResponse = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include',
      });

      if (!sessionResponse.ok) {
        throw new Error('Error al verificar la sesión');
      }

      const session = await sessionResponse.json();
      
      if (session?.user) {
        setAuthState({
          user: session.user,
          isLoading: false,
          error: null,
        });
        // Redirigir al home si el login fue exitoso
        window.location.href = '/';
      } else {
        throw new Error('Error en la autenticación');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error en la autenticación',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Obtener el token CSRF
      const csrfResponse = await fetch(`${API_URL}/api/auth/csrf`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!csrfResponse.ok) {
        throw new Error('Error al obtener el token CSRF');
      }

      const { csrfToken } = await csrfResponse.json();
      
      console.log("csrfToken en logout", csrfToken);

      // Realizar el signout con el token CSRF
      const response = await fetch(`${API_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ csrfToken }),
      });
      
      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      
      // Redirigir al login después de cerrar sesión
      window.location.href = '/login';
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      const session = await response.json();
      
      if (session?.user) {
        setAuthState({
          user: session.user,
          isLoading: false,
          error: null,
        });
        // Redirigir al home si hay sesión activa y estamos en /login
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        error: null, // No mostramos el error al verificar la sesión
      });
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    checkSession,
  };
}; 