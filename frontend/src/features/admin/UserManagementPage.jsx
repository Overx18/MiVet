// frontend/src/features/admin/UserManagementPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';

const ROLES = ['Admin', 'Cliente', 'Veterinario', 'Recepcionista', 'Groomer'];

// Funciones de API
const fetchUsers = async (token) => {
  const { data } = await apiClient.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // 💡 CAMBIO: Devuelve SOLO el array 'users'
  return data.users; 
};

const updateUserRole = async ({ userId, role, token }) => {
  const { data } = await apiClient.put(`/users/${userId}/role`, { role }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export default function UserManagementPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers(token),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el rol.');
    },
  });

  const handleRoleChange = (userId, newRole) => {
    mutation.mutate({ userId, role: newRole, token });
  };

  if (isLoading) return <div>Cargando usuarios...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios y Roles</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Rol Actual</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.firstName} {user.lastName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-2 border rounded-md"
                    disabled={mutation.isPending}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}