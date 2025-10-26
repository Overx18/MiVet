// frontend/src/features/inventory/InventoryListPage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import StockUpdateModal from './StockUpdateModal'; // El nuevo componente modal

// Función de API
const fetchProducts = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient.get(`/products?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};

export default function InventoryListPage() {
  const { token } = useAuthStore();
  const [filters, setFilters] = useState({ name: '', lowStock: false, expiringSoon: false, page: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters, token),
    enabled: !!token,
    keepPreviousData: true,
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      page: 1, // Reset page on filter change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Inventario</h2>
        <Link to="/inventory/products/new" className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">
          Añadir Producto
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
        <input
          type="text"
          name="name"
          placeholder="Buscar por nombre..."
          value={filters.name}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border rounded-md"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="lowStock" checked={filters.lowStock} onChange={handleFilterChange} />
            <span>Stock Bajo</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="expiringSoon" checked={filters.expiringSoon} onChange={handleFilterChange} />
            <span>Caducidad Próxima</span>
          </label>
        </div>
      </div>

      {/* Tabla de Productos */}
      {isLoading ? <div>Cargando inventario...</div> : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Producto</th>
                  <th className="py-2 px-4 border-b text-center">Stock</th>
                  <th className="py-2 px-4 border-b text-right">Precio</th>
                  <th className="py-2 px-4 border-b text-left">Proveedor</th>
                  <th className="py-2 px-4 border-b text-center">Caducidad</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.map(product => (
                  <tr key={product.id}>
                    <td className="py-2 px-4 border-b">{product.name}</td>
                    <td className={`py-2 px-4 border-b text-center font-bold ${product.quantity < 10 ? 'text-red-600 bg-red-100' : ''}`}>
                      {product.quantity}
                    </td>
                    <td className="py-2 px-4 border-b text-right">S/ {parseFloat(product.price || 0).toFixed(2)}</td>
                    <td className="py-2 px-4 border-b">{product.provider || 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-center">{formatDate(product.expiryDate)}</td>
                    <td className="py-2 px-4 border-b text-center">
                        <button onClick={() => openModal(product)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Ajustar Stock
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-6">
            <span>Página {data?.currentPage} de {data?.totalPages || 1}</span>
            <div>
              <button onClick={() => handlePageChange(data.currentPage - 1)} disabled={data?.currentPage <= 1} className="px-4 py-2 border rounded-md mr-2 disabled:opacity-50">Anterior</button>
              <button onClick={() => handlePageChange(data.currentPage + 1)} disabled={data?.currentPage >= data?.totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Siguiente</button>
            </div>
          </div>
            {/* Renderizar el modal */}
            <StockUpdateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </>
      )}
    </div>
  );
}