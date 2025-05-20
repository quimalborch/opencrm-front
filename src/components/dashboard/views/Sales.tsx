import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Plus, Pencil, Trash2, ShoppingCart, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, CalendarIcon, UserCircle, Package, CreditCard, ArrowUpDown, Search, X } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import * as Dialog from '@radix-ui/react-dialog';

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
      try {
        // Parse the date from the server format correctly
        const saleDate = new Date(sale.date);
        
        // Format it to YYYY-MM-DD for the date input element
        const formattedDate = saleDate.toISOString().split('T')[0];
        
        console.log("Original sale date:", sale.date);
        console.log("Formatted date for form:", formattedDate);
        
        setFormData({
          ...sale,
          date: formattedDate // Format date as YYYY-MM-DD for date input
        });
        setOriginalQuantity(sale.quantity);
        const foundProduct = products.find(p => p.id === sale.productId);
        setSelectedProduct(foundProduct || null);
      } catch (error) {
        console.error("Error formatting date:", error);
        // Fallback to current date if there's an error
        setFormData({
          ...sale,
          date: new Date().toISOString().split('T')[0]
        });
        setOriginalQuantity(sale.quantity);
      }
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
        <Dialog.Overlay className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 mt-[64px] md:mt-0 z-40" />
        <Dialog.Content 
          className="
            fixed left-[50%] translate-x-[-50%]
            md:top-[50%] md:translate-y-[-50%]
            top-[80px] bottom-[16px]
            w-[calc(100%-2rem)] md:w-full max-w-3xl 
            md:h-auto md:max-h-[90vh]
            overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
            data-[state=open]:animate-in data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] 
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] 
            flex flex-col z-50
            border border-gray-200 dark:border-gray-800
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
            <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-6">
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <Label htmlFor="productId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Producto
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="productId"
                            value={formData.productId}
                            onChange={(e) => handleProductChange(parseInt(e.target.value))}
                            required
                            className="block w-full pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 h-12 transition-colors"
                          >
                            <option value="">Selecciona un producto</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - Stock: {product.stock}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="clientId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cliente
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="clientId"
                            value={formData.clientId}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                            required
                            className="block w-full pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 h-12 transition-colors"
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
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-3">
                        <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cantidad
                        </Label>
                        <div className="relative">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            required
                            placeholder="1"
                            className="pl-10 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">№</span>
                          </div>
                        </div>
                        {selectedProduct && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            Stock disponible: <span className="font-medium ml-1">{selectedProduct.stock}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="unitPrice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Precio unitario
                        </Label>
                        <div className="relative">
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.unitPrice}
                            onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                            required
                            placeholder="0.00"
                            className="pl-10 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Fecha
                        </Label>
                        <div className="relative">
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                            className="pl-10 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 transition-colors"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {formData.quantity > 0 && formData.unitPrice > 0 && (
                      <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                          <span>Importe total:</span>
                          <span>{new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(formData.quantity * formData.unitPrice)}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 sticky bottom-0 z-10">
                <div className="flex flex-col-reverse md:flex-row md:justify-end md:items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-xl border-gray-300 bg-white h-12 text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-all w-full md:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-12 text-white transition-all duration-200 flex items-center justify-center gap-2 w-full md:w-auto dark:bg-indigo-700 dark:hover:bg-indigo-600"
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
      console.log("Form data before processing:", formData);

      // Get the date directly from the form input (YYYY-MM-DD format)
      const dateString = formData.date;
      console.log("Date from input:", dateString);
      
      // Split the date into components
      const [year, month, day] = dateString.split('-').map(num => parseInt(num));
      
      // Send the date exactly as selected, without timezone conversion
      // Format it as an ISO string but preserve the exact date
      const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00.000Z`;
      
      console.log("Formatted date to send:", formattedDate);
      
      // Ensure numeric values and correct date format
      const processedData = {
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        clientId: Number(formData.clientId),
        productId: Number(formData.productId),
        date: formattedDate // Use the manually formatted ISO string
      };
      
      console.log("Processed data:", processedData);
      
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
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  if (error && sales.length === 0) {
    return (
      <div className="p-6 w-full min-w-0">
        <div className="max-w-full">
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 shadow-lg">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/50 p-3 mb-4">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-medium text-red-800 dark:text-red-300 mb-2">Error al cargar datos</h3>
              <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
              >
                Intentar nuevamente
              </Button>
            </CardContent>
          </Card>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Gestión de Ventas</h1>
            <p className="text-gray-500 dark:text-gray-400">Registra y administra tus ventas de manera eficiente</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex-1 md:flex-none rounded-xl border-gray-300 dark:border-gray-700 h-11 bg-white dark:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button
              onClick={() => {
                setSelectedSale(undefined);
                setIsModalOpen(true);
              }}
              className="flex-1 md:flex-none rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        {isFilterOpen && (
          <Card className="mb-8 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-0 pt-5 px-5 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium flex items-center">
                <Filter className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Filtros avanzados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 bg-white dark:bg-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="clientFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="clientFilter"
                      value={filters.clientId || ""}
                      onChange={(e) => handleFilterChange({ 
                        clientId: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Todos los clientes</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="productFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Producto</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="productFilter"
                      value={filters.productId || ""}
                      onChange={(e) => handleFilterChange({ 
                        productId: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="w-full pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Todos los productos</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por mes/año</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <select
                        id="monthFilter"
                        value={filters.month || ""}
                        onChange={(e) => handleFilterChange({ 
                          month: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Mes</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString('es-ES', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="relative">
                      <select
                        id="yearFilter"
                        value={filters.year || ""}
                        onChange={(e) => handleFilterChange({ 
                          year: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Año</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rango de importe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">€</span>
                      </div>
                      <Input
                        id="minAmountFilter"
                        type="number"
                        placeholder="Mínimo"
                        value={filters.minAmount || ""}
                        onChange={(e) => handleFilterChange({ 
                          minAmount: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="pl-8 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">€</span>
                      </div>
                      <Input
                        id="maxAmountFilter"
                        type="number"
                        placeholder="Máximo"
                        value={filters.maxAmount || ""}
                        onChange={(e) => handleFilterChange({ 
                          maxAmount: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="pl-8 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="dateRangeFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rango de fechas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Input
                        id="startDateFilter"
                        type="date"
                        value={filters.startDate || ""}
                        onChange={(e) => handleFilterChange({ startDate: e.target.value || undefined })}
                        className="rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        id="endDateFilter"
                        type="date"
                        value={filters.endDate || ""}
                        onChange={(e) => handleFilterChange({ endDate: e.target.value || undefined })}
                        className="rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortByFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Ordenar por</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ArrowUpDown className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="sortByFilter"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                      className="w-full pl-10 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="createdAt">Fecha de creación</option>
                      <option value="totalAmount">Importe total</option>
                      <option value="quantity">Cantidad</option>
                      <option value="unitPrice">Precio unitario</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortOrderFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Orden</Label>
                  <div className="relative">
                    <select
                      id="sortOrderFilter"
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
                      className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm h-11 focus:border-indigo-500 focus:ring-indigo-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                    >
                      <option value="desc">Descendente</option>
                      <option value="asc">Ascendente</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 h-11 bg-white dark:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={resetFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading && sales.length > 0 && (
          <div className="flex justify-center my-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-500"></div>
          </div>
        )}
        
        {sales.length === 0 && !isLoading ? (
          <Card className="w-full mb-8 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No se encontraron ventas</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                No hay registros de ventas que coincidan con los filtros establecidos. Prueba con otros criterios o registra una nueva venta.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="rounded-xl border-gray-300 dark:border-gray-700 h-11 bg-white dark:bg-gray-800 transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSale(undefined);
                    setIsModalOpen(true);
                  }}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 h-11 transition-all dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva venta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
            {sales.map((sale) => (
              <Card key={sale.id} className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col">
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                  <div className="flex space-x-3 items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                      <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="font-semibold text-base text-gray-900 dark:text-white">
                      Venta #{sale.id}
                    </CardTitle>
                  </div>
                  <Badge 
                    className={
                      new Date(sale.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }>
                    {new Date(sale.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'Reciente' : formatDate(sale.date)}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Producto</h3>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {sale.product?.name || getProductName(sale.productId)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad</h3>
                      <div className="flex items-center">
                        <span className="text-base font-semibold text-gray-900 dark:text-white">{sale.quantity}</span>
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">unidades</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Precio</h3>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(sale.unitPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cliente</h3>
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {sale.client?.name || getClientName(sale.clientId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(sale.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSale(sale);
                      setIsModalOpen(true);
                    }}
                    className="h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sale.id)}
                    className="h-9 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-1">
              <Button 
                variant="ghost"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="h-9 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex items-center px-2 border-l border-r border-gray-200 dark:border-gray-800 mx-1">
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
                          <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                        )}
                        <Button
                          variant={filters.page === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`min-w-9 h-9 rounded-lg ${
                            filters.page === page 
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                          }`}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              <Button 
                variant="ghost"
                size="sm"
                disabled={filters.page >= pagination.totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="h-9 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
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