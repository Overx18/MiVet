// frontend/src/features/dashboard/DashboardPage.jsx
import { useAuthStore } from '../../store/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Bienvenido a tu panel, {user?.firstName}.</p>
      <p>Tu rol es: <strong>{user?.role}</strong></p>
    </div>
  );
}