import { useState } from 'react';
import { cn } from "../../lib/utils";
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  BarChart,
  LogOut,
  ChevronLeft,
  Menu
} from "lucide-react";
import { DashboardContent } from './DashboardContent';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'reportes', label: 'Reportes', icon: BarChart },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const effectiveCollapsed = isCollapsed && !isHovered;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Botón de menú móvil */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0",
          {
            "w-64": !effectiveCollapsed,
            "w-20": effectiveCollapsed,
            "-translate-x-full lg:translate-x-0": !isMobileMenuOpen,
            "translate-x-0": isMobileMenuOpen,
          }
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn("p-4 border-b border-gray-200 flex items-center", {
          "justify-center": effectiveCollapsed,
          "justify-between": !effectiveCollapsed
        })}>
          {!effectiveCollapsed && <h2 className="text-xl font-bold text-gray-800">OpenCRM</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", {
              "rotate-180": effectiveCollapsed
            })} />
          </button>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveItem(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded-lg transition-colors",
                      {
                        "justify-center": effectiveCollapsed,
                        "space-x-3": !effectiveCollapsed,
                      },
                      activeItem === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!effectiveCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className={cn("p-4 border-t border-gray-200", {
          "flex justify-center": effectiveCollapsed
        })}>
          {isLoading ? (
            <div className={cn("flex items-center", {
              "justify-center": effectiveCollapsed,
              "space-x-3": !effectiveCollapsed
            })}>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              {!effectiveCollapsed && (
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <div className={cn("flex items-center", {
              "justify-center": effectiveCollapsed,
              "justify-between": !effectiveCollapsed
            })}>
              <div className={cn("flex items-center", {
                "space-x-3": !effectiveCollapsed
              })}>
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Usuario'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {!effectiveCollapsed && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </div>
              {!effectiveCollapsed && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full">
            <DashboardContent activeView={activeItem} />
          </div>
        </main>
      </div>
    </div>
  );
} 