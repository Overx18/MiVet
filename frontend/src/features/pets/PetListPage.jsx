// frontend/src/features/pets/PetListPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

// ==== API FUNCTIONS ====
const fetchPets = (params, token) => {
  const queryParams = new URLSearchParams(params).toString();
  return apiClient
    .get(`/pets?${queryParams}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data);
};

const deletePetById = ({ id, token }) =>
  apiClient.delete(`/pets/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// ==== COMPONENTE PRINCIPAL ====
export default function PetListPage() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ ownerName: '', page: 1, limit: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ['pets', filters],
    queryFn: () => fetchPets(filters, token),
    enabled: !!token,
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePetById,
    onSuccess: () => {
      toast.success('Mascota desactivada.');
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al eliminar.'),
  });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta mascota?')) {
      deleteMutation.mutate({ id, token });
    }
  };

  // 🔒 Verificar roles con permiso
  const canRegister = user?.role === 'Recepcionista' || user?.role === 'Administrador' || user?.role === 'Cliente';
  const canEditOrDelete = user?.role === 'Recepcionista' || user?.role === 'Administrador' || user?.role === 'Cliente';

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Listado de Mascotas</h2>

        {/* 🔒 Mostrar botón solo a roles permitidos */}
        {canRegister && (
          <Link
            to="/pets/register"
            className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Registrar Mascota
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="ownerName"
          placeholder="Buscar por propietario..."
          value={filters.ownerName}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {/* Tabla de Mascotas */}
      {isLoading ? (
        <div className="text-center">Cargando mascotas...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">Propietario</th>
                  <th className="py-2 px-4 border-b text-center">Nombre</th>
                  <th className="py-2 px-4 border-b text-center">Especie</th>
                  <th className="py-2 px-4 border-b text-center">Estado</th>
                  {canEditOrDelete && (
                    <th className="py-2 px-4 border-b text-center">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data?.pets?.length ? (
                  data.pets.map((pet) => (
                    <tr key={pet.id}>
                      <td className="py-2 px-4 border-b text-center">
                        {pet.owner?.firstName} {pet.owner?.lastName}
                      </td>
                      <td className="py-2 px-4 border-b text-center">{pet.name}</td>
                      <td className="py-2 px-4 border-b text-center">{pet.species?.name}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pet.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {pet.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {canEditOrDelete && (
                        <td className="py-2 px-4 border-b flex items-center justify-center space-x-2">
                          <Link
                            to={`/pets/${pet.id}/edit`}
                            className="px-3 py-1 text-sm text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                          >
                            Editar
                          </Link>
                          {pet.isActive && (
                            <button
                              onClick={() => handleDelete(pet.id)}
                              disabled={deleteMutation.isPending}
                              className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                            >
                              Desactivar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={canEditOrDelete ? 5 : 4} className="text-center py-4 text-gray-500">
                      No se encontraron mascotas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {data?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span>
                Página {data?.currentPage} de {data?.totalPages}
              </span>
              <div>
                <button
                  onClick={() => handlePageChange(data.currentPage - 1)}
                  disabled={data?.currentPage <= 1}
                  className="px-4 py-2 border rounded-md mr-2 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(data.currentPage + 1)}
                  disabled={data?.currentPage >= data?.totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
