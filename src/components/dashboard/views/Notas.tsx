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
import toast, { Toaster } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface Company {
  id: number;
  name: string;
  taxId: string;
  // Otros campos no relevantes para el selector
}

interface Nota {
  id: number;
  title: string;
  content: string;
  companyId: number;
  company?: Company;
  createdAt?: string;
  updatedAt?: string;
}

type NotaFormData = Omit<Nota, 'id' | 'company' | 'createdAt' | 'updatedAt'>;

const emptyNota: NotaFormData = {
  title: '',
  content: '',
  companyId: 0,
};

interface NotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota?: Nota;
  onSubmit: (data: NotaFormData) => Promise<void>;
  title: string;
  companies: Company[];
}

const NotaModal = ({ isOpen, onClose, nota, onSubmit, title, companies }: NotaModalProps) => {
  const [formData, setFormData] = useState<NotaFormData>(nota || emptyNota);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (nota) {
      setFormData(nota);
    } else {
      setFormData(emptyNota);
    }
  }, [nota]);

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
            flex flex-col
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <Dialog.Title className="text-lg font-bold text-gray-900">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="Título de la nota"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="companyId">Empresa</Label>
                      <select
                        id="companyId"
                        value={formData.companyId}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyId: parseInt(e.target.value) }))}
                        required
                        className="w-full h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      >
                        <option value="">Selecciona una empresa</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Contenido</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        required
                        placeholder="Contenido de la nota..."
                        className="min-h-[200px] px-4 py-3 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 bg-gray-50 p-4 md:p-6 sticky bottom-0 z-10">
                <div className="flex flex-col-reverse md:flex-row md:justify-end md:items-center gap-4">
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
                    ) : nota ? 'Guardar cambios' : 'Crear nota'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export function NotasView() {
  const { user } = useAuth();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNota, setSelectedNota] = useState<Nota | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const finalOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        credentials: 'include' as RequestCredentials,
      };
      
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
        
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error en la petición');
    }
  };

  const fetchNotas = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/notes');
      setNotas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('❌ Error al cargar las notas', { 
        icon: '📋',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/company');
      setCompanies(data);
    } catch (err) {
      toast.error('❌ Error al cargar las empresas', { 
        icon: '🏢',
        duration: 3000
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchNotas(), fetchCompanies()]);
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (formData: NotaFormData) => {
    try {
      if (selectedNota) {
        await makeAuthenticatedRequest(`/api/notes/${selectedNota.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('✅ Nota actualizada correctamente', {
          icon: '📝',
        });
      } else {
        await makeAuthenticatedRequest('/api/notes', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('✅ Nota creada correctamente', {
          icon: '➕',
        });
      }
      fetchNotas();
    } catch (error) {
      toast.error('❌ Error al procesar la operación', {
        icon: '⚠️',
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta nota?')) return;
    
    try {
      await makeAuthenticatedRequest(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      toast.success('✅ Nota eliminada correctamente', {
        icon: '🗑️',
      });
      fetchNotas();
    } catch (error) {
      toast.error('❌ Error al eliminar la nota', {
        icon: '⚠️',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNota(undefined);
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(company => company.id === companyId);
    return company ? company.name : 'Empresa desconocida';
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
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
        }} 
      />
      
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Notas</h1>
          <Button
            onClick={() => {
              setSelectedNota(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Nota
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {notas.map((nota) => (
            <Card key={nota.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{nota.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedNota(nota);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(nota.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Empresa:</span> {nota.company?.name || getCompanyName(nota.companyId)}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {nota.content}
                  </p>
                  {nota.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Creada: {new Date(nota.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <NotaModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          nota={selectedNota}
          onSubmit={handleSubmit}
          title={selectedNota ? 'Editar Nota' : 'Crear Nueva Nota'}
          companies={companies}
        />
      </div>
    </div>
  );
} 