// src/pages/CartPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addresses as addressesApi, orders as ordersApi } from '../api/api';
import { Trash2, Loader2, ShoppingCart } from 'lucide-react';

const CartPage = () => {
  const { items, loading, updateQuantity, removeFromCart, clearCart, totalAmount, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addressList, setAddressList]   = useState([]);
  const [selectedAddr, setSelectedAddr] = useState('');
  const [ordering, setOrdering]         = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    addressesApi.getMine({ pageNumber: 1, pageSize: 50 })
      .then(data => {
        const list = data?.items ?? data ?? [];
        setAddressList(list);
        if (list.length) setSelectedAddr(list[0].id);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleOrder = async () => {
    if (!selectedAddr) { toast.error('Please select a delivery address.'); return; }
    setOrdering(true);
    try {
      const order = await ordersApi.create(selectedAddr);
      await fetchCart(); // backend clears cart on order creation
      navigate(`/checkout/${order.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOrdering(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShoppingCart size={48} className="text-orange-300 mb-4" />
          <p className="text-green-900 mb-4">Please log in to view your cart.</p>
          <Link to="/login" className="px-5 py-2.5 bg-green-900 text-white rounded-xl text-sm hover:bg-green-800 transition">
            Log In
          </Link>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="animate-spin text-orange-400" size={36} />
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShoppingCart size={48} className="text-orange-300 mb-4" />
          <p className="text-green-900 text-lg mb-2">Your cart is empty.</p>
          <Link to="/category" className="text-orange-500 underline text-sm">Browse Products</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-[85%] m-auto py-10">
        <h1 className="text-2xl font-bold text-green-900 mb-8">Shopping Cart ({items.length})</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="lg:basis-2/3 space-y-4">
            {items.map(item => (
              <div key={item.productId}
                className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                {/* Top row on mobile: image + name/price + remove */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-900 truncate">{item.productAdded ?? `Product #${item.productId}`}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ₦{Number(item.price ?? 0).toLocaleString()} each
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)}
                    className="sm:hidden text-gray-400 hover:text-red-500 transition p-1 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Bottom row on mobile: qty + total + remove */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
                    <button onClick={() => item.quantity === 1 ? removeFromCart(item.productId) : updateQuantity(item.productId, item.quantity - 1)}
                      className="hover:text-orange-500 font-bold w-5 text-center">−</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="hover:text-orange-500 font-bold w-5 text-center">+</button>
                  </div>

                  {/* Line total */}
                  <p className="font-semibold text-green-900 w-24 text-right">
                    ₦{Number((item.price ?? 0) * item.quantity).toLocaleString()}
                  </p>

                  {/* Remove — desktop only */}
                  <button onClick={() => removeFromCart(item.productId)}
                    className="hidden sm:block text-gray-400 hover:text-red-500 transition p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-600 underline mt-2">
              Clear cart
            </button>
          </div>

          {/* Order summary */}
          <div className="lg:basis-1/3">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-green-900 text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-gray-600">
                    <span className="truncate max-w-[60%]">{item.productAdded} ×{item.quantity}</span>
                    <span>₦{Number((item.price ?? 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-300 my-3" />
              <div className="flex justify-between font-bold text-green-900">
                <span>Total</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </div>

              {/* Address selection */}
              <div className="mt-5">
                <label className="text-sm font-medium text-green-900 block mb-1">
                  Delivery Address
                </label>
                {addressList.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    No address saved.{' '}
                    <Link to="/account" className="text-orange-500 underline">Add one in your account</Link>
                  </div>
                ) : (
                  <select
                    value={selectedAddr}
                    onChange={e => setSelectedAddr(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700">
                    {addressList.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.street}, {addr.city}, {addr.state}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                onClick={handleOrder}
                disabled={ordering || addressList.length === 0}
                className="mt-5 w-full py-3 bg-green-900 text-orange-100 rounded-xl font-medium text-sm hover:bg-green-800 transition disabled:opacity-50">
                {ordering ? 'Creating Order…' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
