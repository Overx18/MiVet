// frontend/src/features/pets/PetListPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// Funciones de API
const fetchPets = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient.get(`/pets?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);
};
const deletePetById = ({ id, token }) => apiClient.delete(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default function PetListPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ name: '', page: 1, limit: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['pets', filters],
    queryFn: () => fetchPets(filters, token),
    enabled: !!token,
    keepPreviousData: true, // Para una experiencia de paginación más suave
  });

  const deleteMutation = useMutation({
    mutationFn: deletePetById,
    onSuccess: () => {
      toast.success('Mascota archivada.');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al eliminar.'),
  });

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres archivar esta mascota?')) {
      deleteMutation.mutate({ id, token });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Listado de Mascotas</h2>
        <Link to="/pets/register" className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">
          Registrar Mascota
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="name"
          placeholder="Buscar por nombre..."
          value={filters.name}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border rounded-md"
        />
        {/* Aquí se podrían añadir más filtros como selects para especie, etc. */}
      </div>

      {/* Tabla de Mascotas */}
      {isLoading ? (
        <div>Cargando mascotas...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Nombre</th>
                  <th className="py-2 px-4 border-b">Especie</th>
                  <th className="py-2 px-4 border-b">Propietario</th>
                  <th className="py-2 px-4 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.pets?.map(pet => (
                  <tr key={pet.id}>
                    <td className="py-2 px-4 border-b">{pet.name}</td>
                    <td className="py-2 px-4 border-b">{pet.Species?.name}</td>
                    <td className="py-2 px-4 border-b">{pet.owner?.firstName} {pet.owner?.lastName}</td>
                    <td className="py-2 px-4 border-b flex items-center space-x-2">
                      <Link to={`/pets/${pet.id}/edit`} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded-md hover:bg-yellow-600">Editar</Link>
                      <button onClick={() => handleDelete(pet.id)} disabled={deleteMutation.isPending} className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-6">
            <span>Página {data?.currentPage} de {data?.totalPages}</span>
            <div>
              <button onClick={() => handlePageChange(data.currentPage - 1)} disabled={data?.currentPage <= 1} className="px-4 py-2 border rounded-md mr-2 disabled:opacity-50">Anterior</button>
              <button onClick={() => handlePageChange(data.currentPage + 1)} disabled={data?.currentPage >= data?.totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}