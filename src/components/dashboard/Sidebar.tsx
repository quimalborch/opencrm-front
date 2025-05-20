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
  Menu,
  Building2,
  StickyNote,
  Package,
  ShoppingCart
} from "lucide-react";
import { DashboardContent } from './DashboardContent';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: null },
  { id: 'clientes', label: 'Clientes', icon: Users, module: 'clients' },
  { id: 'companies', label: 'Compañías', icon: Building2, module: 'companies' },
  { id: 'notas', label: 'Notas', icon: StickyNote, module: 'notes' },
  { id: 'productos', label: 'Productos', icon: Package, module: 'products' },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart, module: 'sales' },
  { id: 'calendario', label: 'Calendario', icon: Calendar, module: 'tasks' },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, module: null },
  { id: 'reportes', label: 'Reportes', icon: BarChart, module: null },
  { id: 'configuracion', label: 'Configuración', icon: Settings, module: null },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isExpandedFixed, setIsExpandedFixed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // El sidebar está expandido si está fijo en expandido O (si está minimizado pero con hover Y no se acaba de pulsar el botón)
  const isExpanded = isExpandedFixed || (isHovered && !isExpandedFixed);

  const handleToggleExpand = () => {
    setIsExpandedFixed(!isExpandedFixed);
    // Si estamos minimizando, forzamos a quitar el hover
    if (isExpandedFixed) {
      setIsHovered(false);
    }
  };

  // Function to check if user has permission to view a module
  const hasViewPermission = (module: string | null) => {
    // If no module specified, it's always accessible
    if (module === null) return true;
    
    // If no user or no permissions, deny access
    if (!user?.permissions) return false;
    
    // Find the permission for this module
    const permission = user.permissions.find(p => p.module === module);
    
    // If permission exists and view is true, allow access
    return permission?.view === true;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Header móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-200"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="ml-4 text-xl font-bold text-gray-800">OpenCRM</h1>
      </div>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 rounded-r-2xl shadow-lg",
          {
            "w-64": isExpanded,
            "w-20": !isExpanded,
            "-translate-x-full lg:translate-x-0": !isMobileMenuOpen,
            "translate-x-0": isMobileMenuOpen,
          },
          "lg:mt-0 mt-16" // Margen superior en móvil para el header
        )}
        onMouseEnter={() => !isExpandedFixed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header del sidebar (solo visible en desktop) */}
        <div className={cn("p-4 border-b border-gray-200 flex items-center lg:flex hidden", {
          "justify-center": !isExpanded,
          "justify-between": isExpanded
        })}>
          {isExpanded && <h2 className="text-xl font-bold text-gray-800">OpenCRM</h2>}
          <button
            onClick={handleToggleExpand}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700 transition-all duration-200 hover:shadow-sm"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", {
              "rotate-180": !isExpanded
            })} />
          </button>
        </div>

        {/* Resto del sidebar */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasPermission = hasViewPermission(item.module);
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (hasPermission) {
                        setActiveItem(item.id);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    disabled={!hasPermission}
                    className={cn(
                      "w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                      {
                        "justify-center": !isExpanded,
                        "space-x-3": isExpanded,
                        "opacity-40 cursor-not-allowed": !hasPermission,
                      },
                      activeItem === item.id && hasPermission
                        ? "bg-blue-50 text-blue-600 shadow-sm hover:shadow-md hover:bg-blue-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", {
                      "text-blue-500": activeItem === item.id && hasPermission
                    })} />
                    {isExpanded && (
                      <span className={cn("font-medium", {
                        "line-through": !hasPermission
                      })}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del sidebar */}
        <div className={cn("p-4 border-t border-gray-200", {
          "flex justify-center": !isExpanded
        })}>
          {isLoading ? (
            <div className={cn("flex items-center", {
              "justify-center": !isExpanded,
              "space-x-3": isExpanded
            })}>
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              {isExpanded && (
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <div className={cn("flex items-center", {
              "justify-center": !isExpanded,
              "justify-between": isExpanded
            })}>
              <div className={cn("flex items-center", {
                "space-x-3": isExpanded
              })}>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Usuario'}
                      className="w-10 h-10 rounded-xl"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                )}
              </div>
              {isExpanded && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 w-full overflow-hidden",
        "lg:mt-0 mt-16" // Margen superior en móvil para el header
      )}>
        <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full">
            <DashboardContent activeView={activeItem} />
          </div>
        </main>
      </div>
    </div>
  );
} 