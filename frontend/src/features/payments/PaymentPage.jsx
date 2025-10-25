// frontend/src/features/payments/PaymentPage.jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../store/auth.store';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const { token } = useAuthStore();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { data } = await apiClient.post('/payments/create-intent', { appointmentId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error al crear el intento de pago:", error);
      }
    };
    if (token && appointmentId) createIntent();
  }, [appointmentId, token]);

  const options = { clientSecret };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Realizar Pago</h2>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm appointmentId={appointmentId} />
        </Elements>
      )}
    </div>
  );
}