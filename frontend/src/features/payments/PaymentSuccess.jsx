// frontend/src/features/payments/PaymentSuccess.jsx
import { useEffect, useRef } from 'react'; // 1. Importa useRef
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const toastShownRef = useRef(false);
  
  useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('redirect_status');
      
        // 3. Comprueba el estado Y si el toast ya se mostró
        if (status === 'succeeded' && !toastShownRef.current) {
          toastShownRef.current = true; // 4. Marca el toast como mostrado
          toast.success('Pago realizado correctamente');
          setTimeout(() => navigate('/appointments/calendar'), 2500);
        }
      }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">¡Pago exitoso!</h2>
        <p className="text-gray-700">
          Tu pago fue procesado correctamente. Te redirigiremos a tus citas en unos segundos...
        </p>
      </div>
    </div>
  );
}
