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
import { Plus, Pencil, Trash2, ShoppingCart, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";

interface Client {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  // Other fields not relevant for the selector
}

interface Sale {
  id: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
  productId: number;
  clientId: number;
  product?: Product;
  client?: Client;
  createdAt?: string;
  updatedAt?: string;
}

type SaleFormData = Omit<Sale, 'id' | 'totalAmount' | 'product' | 'client' | 'createdAt' | 'updatedAt'>;

const emptySale: SaleFormData = {
  quantity: 1,
  unitPrice: 0,
  date: new Date().toISOString().split('T')[0],
  productId: 0,
  clientId: 0,
};

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: Sale;
  onSubmit: (data: SaleFormData) => Promise<void>;
  title: string;
  clients: Client[];
  products: Product[];
}

const SaleModal = ({ isOpen, onClose, sale, onSubmit, title, clients, products }: SaleModalProps) => {
  const [formData, setFormData] = useState<SaleFormData>(sale || emptySale);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [originalQuantity, setOriginalQuantity] = useState<number>(0);

  useEffect(() => {
    if (sale) {
      setFormData(sale);
      setOriginalQuantity(sale.quantity);
      const foundProduct = products.find(p => p.id === sale.productId);
      setSelectedProduct(foundProduct || null);
    } else {
      setFormData(emptySale);
      setOriginalQuantity(0);
      setSelectedProduct(null);
    }
  }, [sale, products]);

  const handleProductChange = (productId: number) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    
    setFormData(prev => ({ 
      ...prev, 
      productId, 
      unitPrice: product ? product.price : 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stock availability
    if (selectedProduct) {
      const isEditingExistingSale = sale !== undefined;
      
      if (isEditingExistingSale) {
        // If editing sale
        const quantityChange = formData.quantity - originalQuantity;
        
        // Only check stock if increasing quantity
        if (quantityChange > 0 && quantityChange > selectedProduct.stock) {
          toast.error(`⚠️ No hay suficiente stock para aumentar la cantidad. Disponible: ${selectedProduct.stock} unidades`, {
            icon: '📦',
          });
          return;
        }
      } else {
        // For new sales, check full quantity against stock
        if (formData.quantity > selectedProduct.stock) {
          toast.error(`⚠️ Stock insuficiente. Disponible: ${selectedProduct.stock} unidades`, {
            icon: '📦',
          });
          return;
        }
      }
    }
    
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productId">Producto</Label>
                        <select
                          id="productId"
                          value={formData.productId}
                          onChange={(e) => handleProductChange(parseInt(e.target.value))}
                          required
                          className="w-full h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                          <option value="">Selecciona un producto</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - Stock: {product.stock}
                            </option>
                          ))}
                        </select>
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          required
                          placeholder="1"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                        {selectedProduct && (
                          <p className="text-sm text-gray-500">
                            Stock disponible: {selectedProduct.stock}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unitPrice">Precio unitario</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                          required
                          placeholder="0.00"
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          required
                          className="h-11 px-4 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        />
                      </div>
                    </div>
                    
                    {formData.quantity > 0 && formData.unitPrice > 0 && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          Importe total: {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(formData.quantity * formData.unitPrice)}
                        </p>
                      </div>
                    )}
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
                    ) : sale ? 'Guardar cambios' : 'Registrar venta'}
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

interface SaleResponse {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SaleFilters {
  clientId?: number;
  productId?: number;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

export function SalesView() {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  // Filters state
  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

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

  const buildQueryString = (filters: SaleFilters) => {
    const params = new URLSearchParams();
    
    // Add all non-undefined filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  };

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const queryString = buildQueryString(filters);
      const endpoint = `/api/sales${queryString ? `?${queryString}` : ''}`;
      
      const response = await makeAuthenticatedRequest(endpoint);
      
      // Handle new response format
      if (response.data && response.pagination) {
        setSales(response.data);
        setPagination(response.pagination);
      } else {
        // Handle case where the response is a single sale or old format
        setSales(Array.isArray(response) ? response : [response]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error('❌ Error al cargar las ventas', { 
        icon: '🛒',
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

  const fetchProducts = async () => {
    try {
      const data = await makeAuthenticatedRequest('/api/products');
      setProducts(data);
    } catch (err) {
      toast.error('❌ Error al cargar los productos', { 
        icon: '📦',
        duration: 3000
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchSales(), fetchClients(), fetchProducts()]);
    };
    
    fetchData();
  }, []);
  
  // Add effect to refetch when filters change
  useEffect(() => {
    fetchSales();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: Partial<SaleFilters>) => {
    // Reset to page 1 when filters change
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setIsFilterOpen(false);
  };

  const handleSubmit = async (formData: SaleFormData) => {
    try {
      // Ensure numeric values
      const processedData = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice)
      };
      
      if (selectedSale) {
        await makeAuthenticatedRequest(`/api/sales?id=${selectedSale.id}`, {
          method: 'PUT',
          body: JSON.stringify(processedData),
        });
        toast.success('✅ Venta actualizada correctamente', {
          icon: '📝',
        });
      } else {
        await makeAuthenticatedRequest('/api/sales', {
          method: 'POST',
          body: JSON.stringify(processedData),
        });
        toast.success('✅ Venta registrada correctamente', {
          icon: '💰',
        });
      }
      // Refresh data
      await Promise.all([fetchSales(), fetchProducts()]);
    } catch (error) {
      toast.error('❌ Error al procesar la operación', {
        icon: '⚠️',
      });
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta venta? El stock será restaurado.')) return;
    
    try {
      await makeAuthenticatedRequest(`/api/sales?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('✅ Venta eliminada correctamente', {
        icon: '🗑️',
      });
      // Refresh data
      await Promise.all([fetchSales(), fetchProducts()]);
    } catch (error) {
      toast.error('❌ Error al eliminar la venta', {
        icon: '⚠️',
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(undefined);
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Cliente desconocido';
  };

  const getProductName = (productId: number) => {
    const product = products.find(product => product.id === productId);
    return product ? product.name : 'Producto desconocido';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading && sales.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center w-full min-w-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && sales.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button
              onClick={() => {
                setSelectedSale(undefined);
                setIsModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        {isFilterOpen && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientFilter">Cliente</Label>
                  <select
                    id="clientFilter"
                    value={filters.clientId || ""}
                    onChange={(e) => handleFilterChange({ 
                      clientId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full h-10 px-3 rounded-md border-gray-200"
                  >
                    <option value="">Todos los clientes</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productFilter">Producto</Label>
                  <select
                    id="productFilter"
                    value={filters.productId || ""}
                    onChange={(e) => handleFilterChange({ 
                      productId: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full h-10 px-3 rounded-md border-gray-200"
                  >
                    <option value="">Todos los productos</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFilter">Filtrar por mes/año</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      id="monthFilter"
                      value={filters.month || ""}
                      onChange={(e) => handleFilterChange({ 
                        month: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    >
                      <option value="">Mes</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(0, month - 1).toLocaleString('es-ES', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      id="yearFilter"
                      value={filters.year || ""}
                      onChange={(e) => handleFilterChange({ 
                        year: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    >
                      <option value="">Año</option>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountFilter">Rango de importe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="minAmountFilter"
                      type="number"
                      placeholder="Mínimo"
                      value={filters.minAmount || ""}
                      onChange={(e) => handleFilterChange({ 
                        minAmount: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    />
                    <Input
                      id="maxAmountFilter"
                      type="number"
                      placeholder="Máximo"
                      value={filters.maxAmount || ""}
                      onChange={(e) => handleFilterChange({ 
                        maxAmount: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="dateRangeFilter">Rango de fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="startDateFilter"
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    />
                    <Input
                      id="endDateFilter"
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                      className="w-full h-10 px-3 rounded-md border-gray-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortByFilter">Ordenar por</Label>
                  <select
                    id="sortByFilter"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border-gray-200"
                  >
                    <option value="createdAt">Fecha de creación</option>
                    <option value="totalAmount">Importe total</option>
                    <option value="quantity">Cantidad</option>
                    <option value="unitPrice">Precio unitario</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortOrderFilter">Orden</Label>
                  <select
                    id="sortOrderFilter"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border-gray-200"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {sales.length === 0 && !isLoading ? (
          <Card className="w-full mb-6">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron ventas</h3>
              <p className="text-gray-500 text-center mb-4">
                No hay registros de ventas que coincidan con los filtros establecidos
              </p>
              <Button 
                variant="outline" 
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
            {sales.map((sale) => (
              <Card key={sale.id} className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                      Venta #{sale.id}
                    </div>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSale(sale);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900">
                      {sale.product?.name || getProductName(sale.productId)}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Cantidad</p>
                        <p className="text-sm font-medium">{sale.quantity} unidades</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Precio unitario</p>
                        <p className="text-sm font-medium">{formatCurrency(sale.unitPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-600">Total:</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(sale.totalAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 pt-2">
                      <p>Cliente: <span className="font-medium">{sale.client?.name || getClientName(sale.clientId)}</span></p>
                      <p>Fecha: {formatDate(sale.date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <Button 
              variant="outline" 
              size="icon"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current, and pages around current
                  const current = filters.page;
                  return page === 1 || 
                         page === pagination.totalPages || 
                         (page >= current - 1 && page <= current + 1);
                })
                .map((page, index, array) => {
                  // Add ellipsis if there are gaps
                  const prevPage = array[index - 1];
                  const showEllipsisBefore = prevPage && page - prevPage > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={filters.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="min-w-8 h-8"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <SaleModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          sale={selectedSale}
          onSubmit={handleSubmit}
          title={selectedSale ? 'Editar Venta' : 'Registrar Nueva Venta'}
          clients={clients}
          products={products}
        />
      </div>
    </div>
  );
} 