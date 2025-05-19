import { ClientesView } from './views/Clientes';
import { CompaniesView } from './views/Companies';
import { SettingsView } from './views/Settings';
import { NotasView } from './views/Notas';
import { ProductsView } from './views/Products';
import { SalesView } from './views/Sales';

interface DashboardContentProps {
  activeView: string;
}

export function DashboardContent({ activeView }: DashboardContentProps) {
  return (
    <div className="flex flex-col w-full min-w-0">
      {(() => {
        switch (activeView) {
          case 'clientes':
            return <ClientesView />;
          case 'companies':
            return <CompaniesView />;
          case 'configuracion':
            return <SettingsView />;
          case 'notas':
            return <NotasView />;
          case 'productos':
            return <ProductsView />;
          case 'sales':
            return <SalesView />;
          case 'dashboard':
            return (
              <div className="p-6 w-full min-w-0">
                <div className="max-w-full">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
                  <p className="mt-2 text-gray-600">Bienvenido al panel de control</p>
                </div>
              </div>
            );
          default:
            return (
              <div className="p-6 w-full min-w-0">
                <div className="max-w-full">
                  <h1 className="text-2xl font-bold text-gray-900">Sección en Construcción</h1>
                  <p className="mt-2 text-gray-600">Esta sección estará disponible próximamente</p>
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
} 