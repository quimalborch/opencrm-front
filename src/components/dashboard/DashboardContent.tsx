import { ClientesView } from './views/Clientes';

interface DashboardContentProps {
  activeView: string;
}

export function DashboardContent({ activeView }: DashboardContentProps) {
  switch (activeView) {
    case 'clientes':
      return <ClientesView />;
    case 'dashboard':
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <p className="mt-2 text-gray-600">Bienvenido al panel de control</p>
        </div>
      );
    default:
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Sección en Construcción</h1>
          <p className="mt-2 text-gray-600">Esta sección estará disponible próximamente</p>
        </div>
      );
  }
} 