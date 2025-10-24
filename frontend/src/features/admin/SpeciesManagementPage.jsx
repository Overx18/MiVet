// frontend/src/features/admin/SpeciesManagementPage.jsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/button';
import { Edit2, Trash2, PlusCircle, Loader2, Save, X } from 'lucide-react';

// --- API Functions ---
const fetchSpecies = (token) =>
  apiClient.get('/species', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const addSpecies = ({ speciesData, token }) =>
  apiClient.post('/species', speciesData, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const updateSpecies = ({ id, speciesData, token }) =>
  apiClient.put(`/species/${id}`, speciesData, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data);

const removeSpecies = ({ id, token }) =>
  apiClient.delete(`/species/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export default function SpeciesManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', description: '' });

  // --- Queries ---
  const { data: species = [], isLoading, isError } = useQuery({
    queryKey: ['species'],
    queryFn: () => fetchSpecies(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // --- Mutations ---
  const addMutation = useMutation({
    mutationFn: addSpecies,
    onSuccess: () => {
      toast.success('Especie añadida exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
      reset();
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al añadir especie.';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSpecies,
    onSuccess: () => {
      toast.success('Especie actualizada exitosamente.');
      setEditingId(null);
      setEditValues({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al actualizar la especie.';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: removeSpecies,
    onSuccess: () => {
      toast.success('Especie eliminada exitosamente.');
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Error al eliminar la especie.';
      toast.error(message);
    },
  });

  // --- Handlers ---
  const onSubmit = (data) => {
    addMutation.mutate({ speciesData: data, token });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta especie?')) {
      deleteMutation.mutate({ id, token });
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, description: item.description || '' });
  };

  const handleSaveEdit = () => {
    if (!editValues.name.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    updateMutation.mutate({ 
      id: editingId, 
      speciesData: editValues, 
      token 
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: '', description: '' });
  };

  // --- Filtered Species ---
  const filteredSpecies = useMemo(() => {
    return species.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [species, searchTerm]);

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Cargando especies...</span>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Error al cargar las especies. Por favor, intenta nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* --- Formulario de Creación --- */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          Añadir Nueva Especie
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Felino domestico"
              {...register('name', { 
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Descripción
            </label>
            <input
              type="text"
              placeholder="Ej: Características, hábitat..."
              {...register('description', {
                maxLength: { value: 255, message: 'Máximo 255 caracteres' }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button 
              type="submit" 
              disabled={addMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Añadiendo...
                </>
              ) : (
                'Añadir Especie'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* --- Lista de Especies --- */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Catálogo de Especies</h2>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* --- Empty State --- */}
        {filteredSpecies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {species.length === 0 
                ? 'No hay especies registradas aún.' 
                : 'No se encontraron especies con ese término de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descripción</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpecies.map((item) => (
                  <tr 
                    key={item.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{item.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValues.description}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-600">{item.description || '—'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={updateMutation.isPending}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Guardar cambios"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={updateMutation.isPending}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                            title="Cancelar edición"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar especie"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Eliminar especie"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Results Count --- */}
        {filteredSpecies.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-right">
            Mostrando {filteredSpecies.length} de {species.length} especies
          </div>
        )}
      </div>
    </div>
  );
}