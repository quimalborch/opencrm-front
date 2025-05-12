import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Permission {
  userId: string;
  module: string;
  view: boolean;
  create: boolean;
  modify: boolean;
  delete: boolean;
}

export function SettingsView() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<{ [key: string]: Permission[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  const modules = [
    { id: 'customers', name: 'Empresas' },
    { id: 'contacts', name: 'Contactos' },
  ];

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const tokenResponse = await fetch('/api/generate-token');
      const { token, timestamp } = await tokenResponse.json();

      // Ensure headers object exists
      const headers = new Headers(options.headers || {});
      headers.set('Content-Type', 'application/json');
      //headers.set('Authorization', `Bearer ${token}`);

      // Create new options object with the correct headers
      const finalOptions = {
        ...options,
        headers,
        credentials: 'include' as RequestCredentials
      };

      console.log(`Making request to: ${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`);
      console.log('Request options:', {
        method: finalOptions.method,
        headers: Object.fromEntries([...headers.entries()]),
        body: finalOptions.body
      });
      
      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, finalOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP Error ${response.status}: ${errorText}`);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Request error:', error);
      throw new Error(error instanceof Error ? error.message : 'Error en la petición');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/users');
      setUsers(data);
      
      // Cargar permisos para cada usuario
      const userPermissions: { [key: string]: Permission[] } = {};
      for (const user of data) {
        try {
          const userPerms = await makeAuthenticatedRequest(`/api/permissions/${user.id}`);
          userPermissions[user.id] = userPerms;
        } catch (error) {
          console.error(`Error al cargar permisos para usuario ${user.id}:`, error);
          userPermissions[user.id] = modules.map(module => ({
            userId: user.id,
            module: module.id,
            view: false,
            create: false,
            modify: false,
            delete: false,
          }));
        }
      }
      setPermissions(userPermissions);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePermissionChange = async (
    userId: string,
    moduleId: string,
    permissionType: 'view' | 'create' | 'modify' | 'delete',
    value: boolean
  ) => {
    try {
      // Find existing permissions for this module, if any
      const existingPermission = permissions[userId]?.find(p => p.module === moduleId);
      
      // Create API payload with just the fields the API expects
      const apiPayload = {
        userId: userId,
        module: moduleId, // API expects moduleName, not module
        view: permissionType === 'view' ? value : existingPermission?.view || false,
        create: permissionType === 'create' ? value : existingPermission?.create || false,
        modify: permissionType === 'modify' ? value : existingPermission?.modify || false,
        delete: permissionType === 'delete' ? value : existingPermission?.delete || false,
      };
      
      const payloadString = JSON.stringify(apiPayload);
      console.log('Sending permission update:', payloadString);
      
      // Determine if this is a new permission or an update
      const method = existingPermission ? 'PUT' : 'POST';
      const result = await makeAuthenticatedRequest(`/api/permissions/${userId}`, {
        method,
        body: payloadString,
      });
      
      console.log('Permission update result:', result);

      // Update local state
      const updatedPermission = {
        userId,
        module: moduleId,
        view: apiPayload.view,
        create: apiPayload.create,
        modify: apiPayload.modify,
        delete: apiPayload.delete
      };

      setPermissions(prev => ({
        ...prev,
        [userId]: [
          ...(prev[userId]?.filter(p => p.module !== moduleId) || []),
          updatedPermission,
        ],
      }));
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      alert('Error al actualizar permisos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración</h1>
      
      <Tabs defaultValue="permissions" className="w-full">
        <TabsList>
          <TabsTrigger value="permissions">Permisos de Usuario</TabsTrigger>
          {/* Aquí puedes añadir más pestañas de configuración */}
        </TabsList>

        <TabsContent value="permissions" className="mt-6">
          <div className="grid gap-6">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {modules.map((module) => (
                      <div key={module.id} className="space-y-4">
                        <h3 className="font-medium text-lg">{module.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {['view', 'create', 'modify', 'delete'].map((permission) => (
                            <div key={permission} className="flex items-center justify-between space-x-2">
                              <Label htmlFor={`${user.id}-${module.id}-${permission}`} className="capitalize">
                                {permission === 'view' ? 'Ver' :
                                 permission === 'create' ? 'Crear' :
                                 permission === 'modify' ? 'Editar' :
                                 'Eliminar'}
                              </Label>
                              <Switch
                                id={`${user.id}-${module.id}-${permission}`}
                                checked={Boolean(permissions[user.id]?.find(p => p.module === module.id)?.[permission as keyof Permission]) || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(
                                    user.id,
                                    module.id,
                                    permission as 'view' | 'create' | 'modify' | 'delete',
                                    checked
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 