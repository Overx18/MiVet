// Modal que contiene el formulario de Stripe
// frontend/src/features/sales/PaymentModal.jsx
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeCheckoutForm = ({ saleId, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // El webhook se encargará de actualizar el estado, pero podemos redirigir a una página de éxito si queremos.
        // Por simplicidad, aquí solo cerramos el modal al tener éxito.
        return_url: `${window.location.origin}/pos?sale_success=true&sale_id=${saleId}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      // No se llegará aquí si la redirección funciona.
      toast.success("Pago enviado para procesamiento.");
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={isLoading || !stripe} className="w-full mt-4 p-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
        {isLoading ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  );
};

export default function PaymentModal({ isOpen, onClose, clientSecret, saleId, onPaymentSuccess }) {
  if (!clientSecret) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Pago con Tarjeta
              </Dialog.Title>
              <div className="mt-4">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm saleId={saleId} onPaymentSuccess={onPaymentSuccess} />
                </Elements>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}