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
import toast, { Toaster } from 'react-hot-toast';
import { UsersIcon, ShieldCheckIcon, FilterX, X, ShieldIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
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
    { id: 'companies', name: 'Empresas' },
    { id: 'contacts', name: 'Contactos' },
    { id: 'tasks', name: 'Tareas' },
    { id: 'notes', name: 'Notas' },
    { id: 'clients', name: 'Clientes' },
    { id: 'sales', name: 'Ventas' },
    { id: 'products', name: 'Productos' },
  ];

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
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
        if (response.status === 401 || response.status === 403) {
          toast.error('🔒 No tienes permisos para realizar esta acción', {
            icon: '🚫',
          });
          throw new Error('Sin permisos');
        }
        
        if (response.status === 500) {
          const errorData = await response.json();
          toast.error(`🛑 Error del servidor: ${errorData.message || 'Error desconocido'}`, {
            icon: '⚠️',
            duration: 5000,
          });
          throw new Error(`Error del servidor: ${errorData.message || 'Error desconocido'}`);
        }
        
        const errorText = await response.text();
        toast.error(`❌ Error HTTP: ${response.status} - ${errorText}`, {
          icon: '🚫',
          duration: 5000,
        });
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
      setIsLoading(true);
      const data = await makeAuthenticatedRequest('/api/users');
      setUsers(data);
      
      // Cargar permisos para cada usuario (solo para usuarios no administradores)
      const userPermissions: { [key: string]: Permission[] } = {};
      for (const user of data) {
        // Skip permission fetch for admin users
        if (user.isAdmin) continue;
        
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
      toast.error('❌ Error al cargar usuarios', {
        icon: '👤',
        duration: 3000
      });
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
      
      toast.success('✅ Permisos actualizados correctamente', {
        icon: '🔒',
      });

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
      toast.error('❌ Error al actualizar permisos: ' + (error instanceof Error ? error.message : 'Error desconocido'), {
        icon: '⚠️',
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 min-h-[calc(100vh-64px)] w-full">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#2e3444',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
          success: {
            style: {
              background: '#1a7f64',
            },
          },
          error: {
            style: {
              background: '#b91c1c',
            },
          },
        }} 
      />
      
      <div className="max-w-7xl mx-auto p-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Configuración</h1>
            <p className="text-gray-500 dark:text-gray-400">Administra los permisos y configuraciones del sistema</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              className="flex-1 md:flex-none rounded-xl border-gray-300 dark:border-gray-700 h-11 bg-white dark:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FilterX className="mr-2 h-4 w-4" />
              Refrescar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
            <TabsTrigger 
              value="permissions"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm px-4 py-2 transition-all"
            >
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Permisos de Usuario
            </TabsTrigger>
            {/* Aquí puedes añadir más pestañas de configuración */}
          </TabsList>

          <TabsContent value="permissions" className="mt-6">
            <div className="grid gap-6">
              {users.length === 0 ? (
                <Card className="w-full mb-8 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <CardContent className="p-12 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                      <UsersIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No se encontraron usuarios</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                      No hay usuarios registrados en el sistema. Contacta con el administrador para añadir nuevos usuarios.
                    </p>
                    <Button
                      onClick={() => fetchUsers()}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                    >
                      <FilterX className="h-4 w-4 mr-2" />
                      Intentar nuevamente
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.id} className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200">
                    <CardHeader className="p-5 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                            <UsersIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          {user.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 ml-10">{user.email}</p>
                      </div>
                      <Badge className={user.isAdmin 
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"}>
                        {user.isAdmin ? 'Administrador' : 'Usuario activo'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-5">
                      {user.isAdmin ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <ShieldIcon className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Usuario Administrador</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg mb-0">
                            Este usuario tiene privilegios de administrador y acceso total a todas las funcionalidades del sistema.
                            No es necesario configurar permisos individuales.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {modules.map((module) => (
                            <div key={module.id} className="space-y-3 pb-5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                              <h3 className="font-medium text-lg text-gray-900 dark:text-white flex items-center">
                                {module.name}
                                <span className="ml-2 text-xs font-normal px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  {module.id}
                                </span>
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {['view', 'create', 'modify', 'delete'].map((permission) => (
                                  <div key={permission} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-x-3">
                                    <Label htmlFor={`${user.id}-${module.id}-${permission}`} className="text-gray-700 dark:text-gray-300 font-medium">
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
                                      className="data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 