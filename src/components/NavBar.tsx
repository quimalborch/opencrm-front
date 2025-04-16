import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const NavBar = () => {
  const { user, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-xl font-bold text-gray-800">
              OpenCRM
            </a>
          </div>

          <div className="flex items-center">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-4">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </a>
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none"
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-xl text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                >
                  Registrarse
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavBar; 