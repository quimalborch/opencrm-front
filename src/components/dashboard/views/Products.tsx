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
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface Client {
  id: number;
  name: string;
  // Other fields not relevant for the selector
}

interface Product {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  price: number;
  stock: number;
  clientId: number;
  client?: Client;
  createdAt?: string;
  updatedAt?: string;
}

type ProductFormData = Omit<Product, 'id' | 'client' | 'createdAt' | 'updatedAt'>;

const emptyProduct: ProductFormData = {
  name: '',
  image: null,
  description: null,
  price: 0,
  stock: 0,
  clientId: 0,
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  title: string;
  clients: Client[];
}

const ProductModal = ({ isOpen, onClose, product, onSubmit, title, clients }: ProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>(product || emptyProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData(emptyProduct);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log form data before submission to debug the stock value
    console.log('Submitting form data:', formData);
    console.log('Stock value type:', typeof formData.stock, 'Value:', formData.stock);
    
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
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Nombre del producto"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">URL de Imagen</Label>
                      <Input
                        id="image"
                        value={formData.image || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value || null }))}
                        placeholder="URL de la imagen (opcional)"
                        className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                          required
                          placeholder="0.00"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Convert to number and log for debugging
                            const stockValue = value === '' ? 0 : Number(value);
                            console.log('Input stock value:', value, 'Parsed:', stockValue);
                            setFormData(prev => {
                              const newData = { ...prev, stock: stockValue };
                              console.log('Updated form data stock:', newData.stock);
                              return newData;
                            });
                          }}
                          placeholder="0"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Cliente</Label>
                      <select
                        id="clientId"
                        value={formData.clientId}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                        required
                        className="w-full h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      >
                        <option value="">Selecciona un cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value || null }))}
                        placeholder="Descripción del producto (opcional)"
                        className="min-h-[150px] px-4 py-3 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
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
                    ) : product ? 'Guardar cambios' : 'Crear producto'}
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

export function ProductsView() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
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

  const fetchProducts = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/products');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('❌ Error al cargar los productos', { 
        icon: '📦',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/clients');
      setClients(data);
    } catch (err) {
      toast.error('❌ Error al cargar los clientes', { 
        icon: '👥',
        duration: 3000
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchClients()]);
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      // Ensure stock is properly converted to a number
      const processedData = {
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price)
      };
      
      console.log('API submission data:', processedData);
      
      if (selectedProduct) {
        await makeAuthenticatedRequest(`/api/products?id=${selectedProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
        });
        toast.success('✅ Producto actualizado correctamente', {
          icon: '📝',
        });
      } else {
        await makeAuthenticatedRequest('/api/products', {
          method: 'POST',
          body: JSON.stringify(processedData),
        });
        toast.success('✅ Producto creado correctamente', {
          icon: '➕',
        });
      }
      fetchProducts();
    } catch (error) {
      toast.error('❌ Error al procesar la operación', {
        icon: '⚠️',
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      await makeAuthenticatedRequest(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('✅ Producto eliminado correctamente', {
        icon: '🗑️',
      });
      fetchProducts();
    } catch (error) {
      toast.error('❌ Error al eliminar el producto', {
        icon: '⚠️',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(undefined);
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Cliente desconocido';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <Button
            onClick={() => {
              setSelectedProduct(undefined);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          {products.map((product) => (
            <Card key={product.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.image && (
                    <div className="aspect-video w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x300?text=Sin+imagen';
                        }}
                      />
                    </div>
                  )}
                  {!product.image && (
                    <div className="aspect-video w-full bg-gray-100 rounded-md overflow-hidden flex items-center justify-center text-gray-400">
                      <Image className="h-12 w-12" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-600">Precio:</p>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-600">Stock:</p>
                      <p className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock} unidades
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-600">Cliente:</p>
                      <p className="text-sm text-gray-900">{product.client?.name || getClientName(product.clientId)}</p>
                    </div>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                        {product.description}
                      </p>
                    )}
                    
                    {product.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Creado: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          onSubmit={handleSubmit}
          title={selectedProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
          clients={clients}
        />
      </div>
    </div>
  );
} 