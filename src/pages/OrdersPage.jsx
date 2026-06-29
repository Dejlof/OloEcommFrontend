// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { orders as ordersApi, payments as paymentsApi, reviews as reviewsApi, returns as returnsApi } from '../api/api';
import { Loader2, Package, ChevronDown, ChevronUp, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import Pagination from '../components/Pagination';
import ReturnRequestModal from '../components/ReturnRequestModal';

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

const RETURN_WINDOW_DAYS = 7;

const STATUS_COLOURS = {
  pending:         'bg-yellow-100 text-yellow-700',
  processing:      'bg-blue-100   text-blue-700',
  shipped:         'bg-purple-100 text-purple-700',
  delivered:       'bg-green-100  text-green-700',
  cancelled:       'bg-red-100    text-red-600',
  failed:          'bg-red-100    text-red-600',
  returnrequested: 'bg-orange-100 text-orange-700',
  returned:        'bg-teal-100   text-teal-700',
};

function StatusBadge({ status = '' }) {
  const key = status.toLowerCase();
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLOURS[key] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function isWithinReturnWindow(deliveredAt) {
  if (!deliveredAt) return true; // let backend decide if date unknown
  const days = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= RETURN_WINDOW_DAYS;
}

function OrderRow({ order, reviewedProductIds }) {
  const [open, setOpen]               = useState(false);
  const [paying, setPaying]           = useState(false);
  const [returnDetail, setReturnDetail] = useState(null); // detail being returned

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

  const handleReturnSuccess = (detailId) => {
    // Optimistically update status so button disappears
    order.orderDetails = details.map(d =>
      d.id === detailId ? { ...d, orderStatus: 'ReturnRequested' } : d
    );
  };

  return (
    <>
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
              {details.map((d, i) => {
                const isDelivered = d.orderStatus?.toLowerCase() === 'delivered';
                const canReturn   = isDelivered && isWithinReturnWindow(d.deliveredAt);
                return (
                  <div key={i} className="flex items-start justify-between text-sm gap-3">
                    <div>
                      <p className="font-medium text-green-900">{d.productName}</p>
                      <p className="text-xs text-gray-400">Qty: {d.quantity} × ₦{Number(d.price).toLocaleString()}</p>
                      {isDelivered && d.productId && !reviewedProductIds.has(d.productId) && (
                        <Link
                          to={`/product/${d.productId}#review`}
                          className="inline-block mt-1 text-xs text-orange-500 hover:text-orange-700 underline">
                          Leave a Review
                        </Link>
                      )}
                      {canReturn && (
                        <button
                          onClick={() => setReturnDetail(d)}
                          className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition">
                          <RotateCcw size={11} />
                          Return Item
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <p className="font-semibold text-green-900">
                        ₦{Number(d.totalPrice).toLocaleString()}
                      </p>
                      <StatusBadge status={d.orderStatus} />
                    </div>
                  </div>
                );
              })}
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

      {returnDetail && (
        <ReturnRequestModal
          orderDetail={returnDetail}
          onClose={() => setReturnDetail(null)}
          onSuccess={() => handleReturnSuccess(returnDetail.id)}
        />
      )}
    </>
  );
}

const PAGE_SIZE = 10;

const RETURN_REASON_LABELS = {
  0: 'Defective Item',
  1: 'Wrong Item Received',
  2: 'Item Not as Described',
  3: 'Damaged in Shipping',
  4: 'Changed Mind',
};

const RETURN_STATUS_COLOURS = {
  0: 'bg-yellow-100 text-yellow-700',  // Pending
  1: 'bg-blue-100 text-blue-700',      // InitiatorRecommended
  2: 'bg-green-100 text-green-700',    // Approved
  3: 'bg-red-100 text-red-600',        // Rejected
  4: 'bg-purple-100 text-purple-700',  // ItemReceived
  5: 'bg-emerald-100 text-emerald-700',// Refunded
};

const RETURN_STATUS_LABELS = {
  0: 'Pending',
  1: 'Under Review',
  2: 'Approved',
  3: 'Rejected',
  4: 'Item Received',
  5: 'Refunded',
};

function ReturnStatusBadge({ status }) {
  const key = typeof status === 'string' ? parseInt(status, 10) : status;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${RETURN_STATUS_COLOURS[key] ?? 'bg-gray-100 text-gray-600'}`}>
      {RETURN_STATUS_LABELS[key] ?? status}
    </span>
  );
}

function MyReturnsPanel() {
  const [returnList, setReturnList] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    returnsApi.getMine()
      .then(data => setReturnList(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-orange-400" size={36} />
      </div>
    );
  }

  if (returnList.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <RotateCcw size={48} className="text-orange-200 mb-4" />
        <p className="text-green-900 mb-1">No return requests yet.</p>
        <p className="text-sm text-gray-400">Returns you initiate will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {returnList.map(r => (
        <div key={r.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold text-green-900 text-sm">{r.productName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Requested {new Date(r.requestedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <ReturnStatusBadge status={r.status} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
            <div><span className="text-gray-400">Reason: </span>{RETURN_REASON_LABELS[r.reason] ?? r.reason}</div>
            <div><span className="text-gray-400">Refund Amount: </span>
              <span className="font-semibold text-green-900">₦{Number(r.refundAmount).toLocaleString()}</span>
            </div>
            {r.deliveredAt && (
              <div><span className="text-gray-400">Delivered: </span>
                {new Date(r.deliveredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            {r.refundedAt && (
              <div><span className="text-gray-400">Refunded: </span>
                {new Date(r.refundedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            {r.refundReference && (
              <div className="col-span-2"><span className="text-gray-400">Ref: </span>{r.refundReference}</div>
            )}
          </div>

          {r.rejectionReason && (
            <div className="mt-3 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              {r.rejectionReason}
            </div>
          )}

          {r.additionalNotes && (
            <p className="mt-3 text-xs text-gray-500 italic">"{r.additionalNotes}"</p>
          )}
        </div>
      ))}
    </div>
  );
}

const OrdersPage = () => {
  const [activeTab, setActiveTab]           = useState('orders');
  const [orderList, setOrderList]           = useState([]);
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [loading, setLoading]               = useState(true);
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalCount, setTotalCount]         = useState(0);

  useEffect(() => {
    if (activeTab !== 'orders') return;
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
  }, [page, activeTab]);

  return (
    <MainLayout>
      <div className="w-[85%] m-auto py-10 max-w-3xl">
        <h1 className="text-2xl font-bold text-green-900 mb-6">My Orders</h1>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'orders',  label: 'Orders'  },
            { key: 'returns', label: 'Returns' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === t.key
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">{totalCount} order{totalCount !== 1 ? 's' : ''}</p>
            )}
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
          </>
        )}

        {/* Returns tab */}
        {activeTab === 'returns' && <MyReturnsPanel />}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
