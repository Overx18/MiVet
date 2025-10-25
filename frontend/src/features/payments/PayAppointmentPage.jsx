// frontend/src/features/payments/PayAppointmentPage.jsx
import { useLocation, Navigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; // Reutilizamos el mismo formulario de Stripe

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PayAppointmentPage() {
  const location = useLocation();
  
  // Extraer el clientSecret y los datos de la cita del estado de la navegación
  const { clientSecret, appointmentData } = location.state || {};

  // Si no hay clientSecret (ej. el usuario recarga la página o entra por URL),
  // lo redirigimos a la página de agendamiento para que inicie el flujo correctamente.
  if (!clientSecret) {
    return <Navigate to="/appointments/new" replace />;
  }

  const stripeOptions = { clientSecret };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Completa tu Pago</h2>
      <div className="mb-4 p-4 bg-gray-100 rounded-md text-sm">
        <p><strong>Servicio:</strong> {appointmentData?.serviceId}</p> {/* Idealmente aquí mostrarías el nombre del servicio */}
        <p><strong>Fecha:</strong> {new Date(appointmentData?.dateTime).toLocaleString('es-ES')}</p>
      </div>
      <Elements options={stripeOptions} stripe={stripePromise}>
        {/* Pasamos un ID para el return_url, puede ser el de la mascota o cliente */}
        <CheckoutForm appointmentId={appointmentData?.petId} />
      </Elements>
    </div>
  );
}