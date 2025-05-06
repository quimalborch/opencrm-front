import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  taxId: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  size: string;
  type: string;
  status: string;
  notes: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

type CompanyFormData = Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

const emptyCompany: CompanyFormData = {
  name: '',
  taxId: '',
  industry: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: '',
  size: '',
  type: '',
  status: '',
  notes: '',
};

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company;
  onSubmit: (data: CompanyFormData) => Promise<void>;
  title: string;
}

const CompanyModal = ({ isOpen, onClose, company, onSubmit, title }: CompanyModalProps) => {
  const [formData, setFormData] = useState<CompanyFormData>(company || emptyCompany);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'details'>('basic');

  useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData(emptyCompany);
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab, label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        activeTab === tab 
          ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600 md:border-none' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 mt-[64px] md:mt-0" />
        <Dialog.Content 
          className="
            fixed left-[50%] translate-x-[-50%]
            md:top-[50%] md:translate-y-[-50%]
            top-[80px] bottom-[16px]
            w-[calc(100%-2rem)] md:w-full max-w-4xl 
            md:h-auto md:max-h-[90vh]
            overflow-hidden bg-white rounded-xl shadow-2xl 
            data-[state=open]:animate-in data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] 
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] 
            flex flex-col md:flex-row
          "
        >
          {/* Header para móvil */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs para móvil */}
          <div className="md:hidden flex overflow-x-auto border-b border-gray-100 bg-white sticky top-[65px] z-10">
            <div className="flex space-x-4 py-2 px-4 min-w-full">
              <TabButton tab="basic" label="Información Básica" />
              <TabButton tab="contact" label="Contacto" />
              <TabButton tab="details" label="Detalles" />
            </div>
          </div>
          
          {/* Sidebar para desktop */}
          <div className="hidden md:flex w-64 bg-gray-50 p-6 border-r border-gray-100 flex-col">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-6">
              {title}
            </Dialog.Title>
            
            <div className="space-y-2">
              <TabButton tab="basic" label="Información Básica" />
              <TabButton tab="contact" label="Contacto" />
              <TabButton tab="details" label="Detalles" />
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">
                {company ? 'Editando compañía existente' : 'Creando nueva compañía'}
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la compañía</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Ej: Acme Inc."
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">ID Fiscal</Label>
                        <Input
                          id="taxId"
                          value={formData.taxId}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                          required
                          placeholder="Ej: B12345678"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industria</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="Ej: Tecnología"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                          placeholder="Ej: S.L."
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Tamaño</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                          placeholder="Ej: 50-100 empleados"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contacto@empresa.com"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+34 123 456 789"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Sitio Web</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="www.empresa.com"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Calle Principal 123"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Madrid"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="España"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Input
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        placeholder="Ej: Activo"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Añade cualquier información adicional relevante..."
                        className="min-h-[200px] px-4 py-3 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50 p-4 md:p-6 sticky bottom-0 z-10">
                <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center gap-4">
                  <div className="text-sm text-gray-500 hidden md:block">
                    {activeTab === 'basic' ? '1/3' : activeTab === 'contact' ? '2/3' : '3/3'}
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="h-11 px-4 rounded-lg border-gray-200 hover:bg-gray-50 transition-colors duration-200 w-full md:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="h-11 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          <span>Guardando...</span>
                        </>
                      ) : company ? 'Guardar cambios' : 'Crear compañía'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export function CompaniesView() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {

      const finalOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
        },
        credentials: 'include',
      };

      const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}${endpoint}`, finalOptions);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en la petición');
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/company');
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('Error al cargar las compañías');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (formData: CompanyFormData) => {
    try {
      if (selectedCompany) {
        await makeAuthenticatedRequest(`/api/company/${selectedCompany.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Compañía actualizada correctamente');
      } else {
        await makeAuthenticatedRequest('/api/company', {
          method: 'POST',
          body: JSON.stringify({ ...formData, userId: user?.id }),
        });
        toast.success('Compañía creada correctamente');
      }
      fetchCompanies();
    } catch (error) {
      toast.error('Error al procesar la operación');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta compañía?')) return;
    
    try {
      await makeAuthenticatedRequest(`/api/company/${id}`, {
        method: 'DELETE',
      });
      toast.success('Compañía eliminada correctamente');
      fetchCompanies();
    } catch (error) {
      toast.error('Error al eliminar la compañía');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(undefined);
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Compañías</h1>
          <Button
            onClick={() => {
              setSelectedCompany(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Compañía
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {companies.map((company) => (
            <Card key={company.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{company.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedCompany(company);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ID Fiscal:</span> {company.taxId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {company.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teléfono:</span> {company.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ubicación:</span> {company.city}, {company.country}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Estado:</span> {company.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CompanyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          company={selectedCompany}
          onSubmit={handleSubmit}
          title={selectedCompany ? 'Editar Compañía' : 'Crear Nueva Compañía'}
        />
      </div>
    </div>
  );
} 