// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { orders as ordersApi, payments as paymentsApi } from '../api/api';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

const CheckoutPage = () => {
  const { orderId } = useParams();

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(false);
  const [error, setError]     = useState(''); // kept for full-page load error only

  useEffect(() => {
    if (!orderId) return;
    ordersApi.getById(orderId)
      .then(setOrder)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const payment = await paymentsApi.initialize(orderId);

      if (!payment?.authorizationUrl) {
        toast.error('Could not generate payment link. Please try again.');
        return;
      }

      // Redirect user to Paystack checkout page
      window.location.href = payment.authorizationUrl;
    } catch (err) {
      toast.error(err.message ?? 'Payment initialization failed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-orange-400" size={36} />
      </div>
    </MainLayout>
  );

  if (error && !order) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/cart" className="text-orange-500 underline text-sm">Back to Cart</Link>
      </div>
    </MainLayout>
  );

  const allDetails = order?.orderDetails ?? [];

  return (
    <MainLayout>
      <div className="w-[85%] m-auto py-10 max-w-2xl">

        <h1 className="text-2xl font-bold text-green-900 mb-2">Order Confirmation</h1>
        <p className="text-sm text-gray-500 mb-8">Order #{order?.id} — Review your order before paying</p>

        {/* Order items */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-green-900 text-sm">Items in this order</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {allDetails.map((d, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-green-900">{d.productName}</p>
                  <p className="text-gray-400 text-xs">Qty: {d.quantity} × ₦{Number(d.price).toLocaleString()}</p>
                </div>
                <p className="font-semibold text-green-900">₦{Number(d.totalPrice).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>₦{Number(order?.amount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery Fee</span>
              <span>₦{Number(order?.deliveryFee ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₦{Number(order?.totalAmount ?? order?.amount ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        {order?.addressOrdered && (
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-6">
            <h2 className="font-semibold text-green-900 text-sm mb-1">Delivery Address</h2>
            <p className="text-sm text-gray-600">{order.addressOrdered}</p>
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full py-3.5 bg-green-900 text-orange-100 rounded-xl font-semibold text-sm
                     hover:bg-green-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {paying ? (
            <><Loader2 size={18} className="animate-spin" /> Initializing payment…</>
          ) : (
            <><ExternalLink size={16} /> Pay ₦{Number(order?.totalAmount ?? order?.amount ?? 0).toLocaleString()} via Paystack</>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          You'll be redirected to Paystack's secure checkout.
        </p>

        <div className="text-center mt-4">
          <Link to="/cart" className="text-sm text-orange-500 hover:text-orange-700 underline">
            ← Back to Cart
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
