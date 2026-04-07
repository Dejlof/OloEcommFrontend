// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { orders as ordersApi, payments as paymentsApi, reviews as reviewsApi } from '../api/api';
import { Loader2, Package, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAYMENT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const BACKEND_OFFSET_MS = 60 * 60 * 1000; // backend is 1 hour behind — remove when fixed

function useCountdown(orderDate) {
  const deadline = new Date(orderDate).getTime() + PAYMENT_WINDOW_MS - BACKEND_OFFSET_MS;
  const getRemaining = () => Math.max(0, deadline - Date.now());
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (remaining === 0) return;
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { remaining, mins, secs };
}

function PendingCountdown({ orderDate }) {
  const { remaining, mins, secs } = useCountdown(orderDate);
  const urgent = remaining < 5 * 60 * 1000; // last 5 mins

  if (remaining === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
        <Clock size={13} />
        Payment window expired — order may be cancelled
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border ${
      urgent
        ? 'text-red-600 bg-red-50 border-red-200'
        : 'text-yellow-700 bg-yellow-50 border-yellow-200'
    }`}>
      <Clock size={13} className={urgent ? 'animate-pulse' : ''} />
      Pay within{' '}
      <span className="font-bold tabular-nums">
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {' '}or order will be cancelled
    </div>
  );
}

const STATUS_COLOURS = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100  text-blue-700',
  shipped:    'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100  text-green-700',
  cancelled:  'bg-red-100    text-red-600',
  failed:     'bg-red-100    text-red-600',
};

function StatusBadge({ status = '' }) {
  const key = status.toLowerCase();
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLOURS[key] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function OrderRow({ order, reviewedProductIds }) {
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const details = order.orderDetails ?? [];
  const hasPending = details.some(d => d.orderStatus?.toLowerCase() === 'pending');

  const handlePay = async () => {
    setPaying(true);
    try {
      const payment = await paymentsApi.initialize(order.id);
      if (payment?.authorizationUrl)
        window.location.href = payment.authorizationUrl;
      else
        toast.error('Could not generate payment link.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex flex-row items-center gap-2">
            <span className="font-semibold text-green-900 text-sm">Order #{order.id}</span>
            <span className="text-xs text-gray-400">
              {new Date(order.orderDate).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
          {hasPending && <PendingCountdown orderDate={order.orderDate} />}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-green-900 text-sm">
            ₦{Number(order.totalAmount ?? order.amount).toLocaleString()}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Details */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-500 mb-3">
            Delivery: {order.addressOrdered}
          </p>

          <div className="space-y-3">
            {details.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-green-900">{d.productName}</p>
                  <p className="text-xs text-gray-400">Qty: {d.quantity} × ₦{Number(d.price).toLocaleString()}</p>
                  {d.orderStatus?.toLowerCase() === 'delivered' && d.productId && !reviewedProductIds.has(d.productId) && (
                    <Link
                      to={`/product/${d.productId}#review`}
                      className="inline-block mt-1 text-xs text-orange-500 hover:text-orange-700 underline">
                      Leave a Review
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-green-900">
                    ₦{Number(d.totalPrice).toLocaleString()}
                  </p>
                  <StatusBadge status={d.orderStatus} />
                </div>
              </div>
            ))}
          </div>

          {/* Order totals */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₦{Number(order.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>₦{Number(order.deliveryFee ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-green-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>₦{Number(order.totalAmount ?? order.amount).toLocaleString()}</span>
            </div>
          </div>

          {/* Pay now if still pending */}
          {hasPending && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handlePay}
                disabled={paying}
                className="px-5 py-2 bg-green-900 text-orange-100 text-sm rounded-xl hover:bg-green-800 transition disabled:opacity-50">
                {paying ? 'Redirecting…' : 'Complete Payment →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PAGE_SIZE = 10;

const OrdersPage = () => {
  const [orderList, setOrderList]           = useState([]);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [loading, setLoading]               = useState(true);
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalCount, setTotalCount]         = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      ordersApi.getMine({ pageNumber: page, pageSize: PAGE_SIZE }),
      reviewsApi.getMine({ pageNumber: 1, pageSize: 200 }).catch(() => null),
    ])
      .then(([data, myReviews]) => {
        setOrderList(data?.items ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotalCount(data?.totalCount ?? 0);
        const reviewItems = myReviews?.items ?? myReviews ?? [];
        setReviewedProductIds(new Set(reviewItems.map(r => r.productId)));
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <MainLayout>
      <div className="w-[85%] m-auto py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-green-900">My Orders</h1>
          {totalCount > 0 && (
            <span className="text-sm text-gray-500">{totalCount} order{totalCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-orange-400" size={36} />
          </div>
        ) : orderList.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package size={48} className="text-orange-200 mb-4" />
            <p className="text-green-900 mb-2">You have no orders yet.</p>
            <Link to="/category" className="text-orange-500 underline text-sm">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orderList.map(order => (
                <OrderRow key={order.id} order={order} reviewedProductIds={reviewedProductIds} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
