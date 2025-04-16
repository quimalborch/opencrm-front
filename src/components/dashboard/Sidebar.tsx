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
  LogOut
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
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">OpenCRM</h2>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      activeItem === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
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
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <DashboardContent activeView={activeItem} />
      </main>
    </>
  );
} 