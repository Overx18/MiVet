// frontend/src/features/payments/CheckoutForm.jsx
import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

export default function CheckoutForm({ appointmentId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
  
    setIsLoading(true);
  
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?appointment_id=${appointmentId}`,
        },
      });
  
      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          toast.error(error.message);
        } else {
          toast.error("Ocurrió un error inesperado.");
        }
      }
    } catch (err) {
      console.warn("Stripe confirmPayment warning:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" className="w-full mt-6 px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
        <span id="button-text">
          {isLoading ? "Procesando..." : "Pagar ahora"}
        </span>
      </button>
    </form>
  );
}