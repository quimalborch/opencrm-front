import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

export function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<CompanyFormData | Company>(emptyCompany);

  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const tokenResponse = await fetch('/api/generate-token');
      const { token, timestamp } = await tokenResponse.json();

      const defaultHeaders = {
        'x-opencrm-auth': token,
        'x-timestamp': timestamp.toString(),
        'Content-Type': 'application/json',
      };

      const finalOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => {
    e.preventDefault();
    try {
      if (isEdit && 'id' in currentCompany) {
        await makeAuthenticatedRequest(`/api/company/${(currentCompany as Company).id}`, {
          method: 'PUT',
          body: JSON.stringify(currentCompany),
        });
        toast.success('Compañía actualizada correctamente');
      } else {
        await makeAuthenticatedRequest('/api/company', {
          method: 'POST',
          body: JSON.stringify(currentCompany),
        });
        toast.success('Compañía creada correctamente');
      }
      fetchCompanies();
      setIsEditDialogOpen(false);
      setIsCreateDialogOpen(false);
      setCurrentCompany(emptyCompany);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la operación');
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

  const CompanyForm = ({ isEdit }: { isEdit: boolean }) => (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e, isEdit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={currentCompany.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxId">ID Fiscal</Label>
          <Input
            id="taxId"
            value={currentCompany.taxId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, taxId: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industria</Label>
          <Input
            id="industry"
            value={currentCompany.industry}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, industry: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Sitio Web</Label>
          <Input
            id="website"
            value={currentCompany.website}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, website: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={currentCompany.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, phone: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={currentCompany.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={currentCompany.address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, address: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={currentCompany.city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, city: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            value={currentCompany.country}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, country: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Tamaño</Label>
          <Input
            id="size"
            value={currentCompany.size}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, size: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Input
            id="type"
            value={currentCompany.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, type: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Input
            id="status"
            value={currentCompany.status}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCompany({...currentCompany, status: e.target.value})}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={currentCompany.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentCompany({...currentCompany, notes: e.target.value})}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit">{isEdit ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  );

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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setCurrentCompany(emptyCompany)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Compañía
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Compañía</DialogTitle>
              </DialogHeader>
              <CompanyForm isEdit={false} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {companies.map((company) => (
            <Card key={company.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{company.name}</CardTitle>
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentCompany(company)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Editar Compañía</DialogTitle>
                      </DialogHeader>
                      <CompanyForm isEdit={true} />
                    </DialogContent>
                  </Dialog>
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
      </div>
    </div>
  );
} 