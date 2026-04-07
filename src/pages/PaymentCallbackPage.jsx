// src/pages/PaymentCallbackPage.jsx
// Paystack redirects back to this page after payment.
// URL format: /payment/callback?reference=OLO-42-abc123
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { payments as paymentsApi } from '../api/api';
import { useCart } from '../context/CartContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const POLL_INTERVAL_MS = 4000;  // check every 4 s
const MAX_ATTEMPTS     = 20;    // give up after ~60 s

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');
  const { fetchCart } = useCart();

  const [status,  setStatus]  = useState('checking'); // checking | success | failed | error
  const [payment, setPayment] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const timerRef   = useRef(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    if (!reference) { setStatus('error'); return; }

    const check = async () => {
      attemptRef.current += 1;
      setAttempt(attemptRef.current);

      try {
        const p = await paymentsApi.getByReference(reference);
        setPayment(p);
        const s = p?.paymentStatus?.toLowerCase();

        if (s === 'completed' || s === 'successful') {
          clearInterval(timerRef.current);
          setStatus('success');
          fetchCart();
          return;
        }

        if (s !== 'pending') {
          clearInterval(timerRef.current);
          setStatus('failed');
          return;
        }

        // Still pending — stop if we've hit the limit
        if (attemptRef.current >= MAX_ATTEMPTS) {
          clearInterval(timerRef.current);
          setStatus('timeout');
        }
      } catch {
        clearInterval(timerRef.current);
        setStatus('error');
      }
    };

    // Run immediately, then on an interval
    check();
    timerRef.current = setInterval(check, POLL_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [reference]);

  const content = {
    checking: {
      icon: <Loader2 size={48} className="animate-spin text-orange-400 mb-4" />,
      title: 'Verifying your payment…',
      sub: 'We\'re confirming your transaction with Paystack. This usually takes a few seconds.',
    },
    success: {
      icon: <CheckCircle size={48} className="text-green-500 mb-4" />,
      title: 'Payment Successful!',
      sub: `Your payment of ₦${Number(payment?.amount ?? 0).toLocaleString()} has been confirmed. Your order is now being processed.`,
    },
    failed: {
      icon: <XCircle size={48} className="text-red-400 mb-4" />,
      title: 'Payment Failed',
      sub: 'Your payment could not be completed. No charge was made. Please try again.',
    },
    timeout: {
      icon: <XCircle size={48} className="text-orange-400 mb-4" />,
      title: 'Still Pending',
      sub: 'Payment confirmation is taking longer than expected. Check your orders page in a moment — your payment may still go through.',
    },
    error: {
      icon: <XCircle size={48} className="text-gray-400 mb-4" />,
      title: 'Something went wrong',
      sub: 'We could not verify your payment status. Please check your orders or contact support.',
    },
  }[status];

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6">
        {content.icon}
        <h1 className="text-2xl font-bold text-green-900 mb-2">{content.title}</h1>
        <p className="text-gray-500 text-sm max-w-sm mb-8">{content.sub}</p>

        {/* Polling progress dots */}
        {status === 'checking' && (
          <div className="flex items-center gap-1.5 mb-6">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
              <span key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < attempt ? 'bg-orange-400' : 'bg-gray-200'
                }`} />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {status === 'success' && (
            <Link to="/orders"
              className="px-5 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
              View My Orders
            </Link>
          )}
          {(status === 'failed' || status === 'error') && (
            <Link to="/cart"
              className="px-5 py-2.5 bg-orange-300 text-green-900 rounded-xl text-sm hover:bg-orange-400 transition">
              Return to Cart
            </Link>
          )}
          {status === 'timeout' && (
            <Link to="/orders"
              className="px-5 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
              Check My Orders
            </Link>
          )}
          <Link to="/"
            className="px-5 py-2.5 border border-gray-300 text-green-900 rounded-xl text-sm hover:bg-gray-50 transition">
            Go Home
          </Link>
        </div>

        {reference && (
          <p className="mt-6 text-xs text-gray-400">Reference: {reference}</p>
        )}
      </div>
    </MainLayout>
  );
};

export default PaymentCallbackPage;
