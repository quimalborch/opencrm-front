import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";

interface Cliente {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
}

export function ClientesView() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      // Combinar opciones
      const finalOptions = {
        ...options,
        headers: {
          ...options.headers,
        },
        credentials: 'include', // Asegura que las cookies se envíen con la petición
      };

      // Hacer la petición
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, finalOptions);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en la petición');
    }
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await makeAuthenticatedRequest('/api/clients');
        setClientes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center w-full min-w-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full min-w-0">
        <div className="max-w-full">
          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-w-0">
      <div className="max-w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Clientes</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-xl">{cliente.name} {cliente.surname}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {cliente.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teléfono:</span> {cliente.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Dirección:</span> {cliente.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 