import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { products as productsApi, categories as categoriesApi, orders as ordersApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  Package, Plus, Trash2, Edit2, Image, Loader2,
  ShoppingBag, AlertCircle, ClipboardList,
  Truck, CheckCircle, XCircle, Star, BarChart2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import Pagination from '../components/Pagination';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, colour }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colour}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-green-900">{value}</p>
      </div>
    </div>
  );
}

// ── Edit product modal ────────────────────────────────────────────────────────
function EditModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name:            product.name ?? '',
    description:     product.description ?? '',
    price:           product.price ?? '',
    discountPrice:   product.discountPrice ?? '',
    quantityInStock: product.quantityInStock ?? '',
  });
  const [categoryId, setCategoryId] = useState(product.categoryId ?? '');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await productsApi.update(product.id, {
        name:            form.name,
        description:     form.description,
        price:           parseFloat(form.price),
        discountPrice:   form.discountPrice ? parseFloat(form.discountPrice) : undefined,
        quantityInStock: parseInt(form.quantityInStock, 10)
      });
      onSave(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-green-900 mb-5">Edit Product</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSave} className="space-y-4">
          {[
            { name: 'name',            label: 'Name',                type: 'text'   },
            { name: 'price',           label: 'Price (₦)',           type: 'number' },
            { name: 'discountPrice',   label: 'Discount Price (₦)',  type: 'number' },
            { name: 'quantityInStock', label: 'Quantity in Stock',   type: 'number' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700">
              <option value="">-- Keep current --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Order status badge ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped:    'bg-blue-100 text-blue-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ── Orders section ────────────────────────────────────────────────────────────
function OrdersSection({ orders, loading, onAction }) {
  const [actionId, setActionId] = useState(null);

  const handleAction = async (orderId, action) => {
    setActionId(`${orderId}-${action}`);
    await onAction(orderId, action);
    setActionId(null);
  };

  const isActing  = (id, action) => actionId === `${id}-${action}`;
  const anyActing = (id)         => actionId?.startsWith(`${id}-`);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-orange-400" size={32} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <ClipboardList size={40} className="text-orange-200 mb-3" />
        <p className="text-gray-500">No orders yet for your products.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-5 py-3">Order ID</th>
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Qty</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-4 text-gray-400 text-xs font-mono">#{order.id}</td>
              <td className="px-5 py-4">
                <Link to={`/product/${order.productId}`}
                  className="font-medium text-green-900 hover:text-orange-500 transition">
                  {order.productName}
                </Link>
              </td>
              <td className="px-5 py-4 text-gray-600">{order.quantity}</td>
              <td className="px-5 py-4 font-semibold text-green-900">
                ₦{Number(order.totalPrice).toLocaleString()}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={order.orderStatus} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  {order.orderStatus === 'Processing' && (
                    <button
                      onClick={() => handleAction(order.id, 'ship')}
                      disabled={!!anyActing(order.id)}
                      title="Mark as Shipped"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition">
                      {isActing(order.id, 'ship')
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Truck size={13} />}
                      Ship
                    </button>
                  )}
                  {order.orderStatus === 'Shipped' && (
                    <button
                      onClick={() => handleAction(order.id, 'deliver')}
                      disabled={!!anyActing(order.id)}
                      title="Mark as Delivered"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-40 transition">
                      {isActing(order.id, 'deliver')
                        ? <Loader2 size={13} className="animate-spin" />
                        : <CheckCircle size={13} />}
                      Deliver
                    </button>
                  )}
                  {(order.orderStatus === 'Processing' || order.orderStatus === 'Shipped') && (
                    <button
                      onClick={() => handleAction(order.id, 'cancel')}
                      disabled={!!anyActing(order.id)}
                      title="Cancel Order"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 disabled:opacity-40 transition">
                      {isActing(order.id, 'cancel')
                        ? <Loader2 size={13} className="animate-spin" />
                        : <XCircle size={13} />}
                      Cancel
                    </button>
                  )}
                  {(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') && (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PRODUCTS_PAGE_SIZE = 10;
const ORDERS_PAGE_SIZE   = 10;

// ── Main page ─────────────────────────────────────────────────────────────────
const VendorPage = () => {
  const { user } = useAuth();

  const [activeTab,        setActiveTab]        = useState('products');
  const [myProducts,       setMyProducts]       = useState([]);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsTotalCount, setProductsTotalCount] = useState(0);
  const [productsPage,     setProductsPage]     = useState(1);
  const [categories,       setCategories]       = useState([]);
  const [vendorOrders,     setVendorOrders]     = useState([]);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);
  const [ordersPage,       setOrdersPage]       = useState(1);
  const [loading,          setLoading]          = useState(true);
  const [ordersLoading,    setOrdersLoading]    = useState(true);
  const [editProduct,      setEditProduct]      = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [error,            setError]            = useState('');
  const [ordersError,      setOrdersError]      = useState('');

  // Full data used only for accurate stat cards (not the table)
  const [statsProducts, setStatsProducts] = useState([]);
  const [statsOrders,   setStatsOrders]   = useState([]);

  // Paginated table fetch
  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.getMine({ pageNumber: productsPage, pageSize: PRODUCTS_PAGE_SIZE }),
      categoriesApi.getAll({ pageNumber: 1, pageSize: 100 }),
    ])
      .then(([prodsData, catsData]) => {
        setMyProducts(prodsData?.items ?? []);
        setProductsTotalPages(prodsData?.totalPages ?? 1);
        setProductsTotalCount(prodsData?.totalCount ?? 0);
        setCategories(catsData?.items ?? catsData ?? []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productsPage]);

  useEffect(() => {
    setOrdersLoading(true);
    ordersApi.getMyVendorOrders({ pageNumber: ordersPage, pageSize: ORDERS_PAGE_SIZE })
      .then(data => {
        setVendorOrders(data?.items ?? []);
        setOrdersTotalPages(data?.totalPages ?? 1);
        setOrdersTotalCount(data?.totalCount ?? 0);
      })
      .catch(err => setOrdersError(err.message))
      .finally(() => setOrdersLoading(false));
  }, [ordersPage]);

  // Full fetch for accurate stat cards — runs once on mount
  useEffect(() => {
    Promise.all([
      productsApi.getMine({ pageNumber: 1, pageSize: 500 }),
      ordersApi.getMyVendorOrders({ pageNumber: 1, pageSize: 500 }),
    ])
      .then(([prodsData, ordsData]) => {
        setStatsProducts(prodsData?.items ?? []);
        setStatsOrders(ordsData?.items ?? []);
      })
      .catch(() => {});
  }, []);

  const handleDelete = (id) => {
    confirmToast('Delete this product permanently?', async () => {
      setDeletingId(id);
      try {
        await productsApi.deleteMine(id);
        setMyProducts(prev => prev.filter(p => p.id !== id));
        setStatsProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        toast.error(err.message);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleSaved = (updated) => {
    setMyProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditProduct(null);
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      if (action === 'ship')    await ordersApi.shipOrder(orderId);
      if (action === 'deliver') await ordersApi.deliverOrder(orderId);
      if (action === 'cancel')  await ordersApi.cancelOrder(orderId);

      const statusMap = { ship: 'Shipped', deliver: 'Delivered', cancel: 'Cancelled' };
      const updater = o => o.id === orderId ? { ...o, orderStatus: statusMap[action] } : o;
      setVendorOrders(prev => prev.map(updater));
      setStatsOrders(prev => prev.map(updater));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalStock    = statsProducts.reduce((s, p) => s + (p.quantityInStock ?? 0), 0);
  const outOfStock    = statsProducts.filter(p => !p.quantityInStock).length;
  const pendingOrders = statsOrders.filter(o => o.orderStatus === 'Processing').length;
  const totalProducts = productsTotalCount;
  const totalOrders   = ordersTotalCount;

  const allReviews   = statsProducts.flatMap(p => p.reviews ?? []);
  const totalRatings = allReviews.length;
  const avgRating    = totalRatings > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / totalRatings).toFixed(1)
    : null;

  return (
    <MainLayout>
      <div className="w-[90%] m-auto py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Vendor Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, <span className="font-medium">{user?.username}</span>
            </p>
          </div>
          <Link to="/addproduct"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
            <Plus size={16} /> Add New Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard label="My Products"    value={totalProducts}                      icon={Package}       colour="bg-green-600"  />
          <StatCard label="Total Stock"    value={totalStock}                         icon={ShoppingBag}   colour="bg-blue-500"   />
          <StatCard label="Pending Orders" value={pendingOrders}                      icon={ClipboardList} colour="bg-orange-400" />
          <StatCard label="Out of Stock"   value={outOfStock}                         icon={AlertCircle}   colour="bg-red-500"    />
          <StatCard label="Avg Rating"     value={avgRating ? `${avgRating} ★` : '—'} icon={Star}          colour="bg-yellow-400" />
          <StatCard label="Total Ratings"  value={totalRatings || '—'}               icon={BarChart2}     colour="bg-purple-500" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'products', label: 'Products', count: totalProducts },
            { key: 'orders',   label: 'Orders',   count: totalOrders   },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                activeTab === tab.key ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Products panel */}
        {activeTab === 'products' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-green-900">My Products ({totalProducts})</h2>
            </div>

            {error && (
              <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-orange-400" size={32} />
              </div>
            ) : myProducts.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Package size={40} className="text-orange-200 mb-3" />
                <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                <Link to="/addproduct"
                  className="px-4 py-2 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 transition">
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Rating</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                              {product.productImages?.[0]?.url
                                ? <img src={product.productImages[0].url} className="w-full h-full object-cover" alt="" />
                                : <span className="text-xl">📦</span>}
                            </div>
                            <div>
                              <Link to={`/product/${product.id}`}
                                className="font-medium text-green-900 hover:text-orange-500 transition">
                                {product.name}
                              </Link>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-green-900">
                          ₦{Number(product.price).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.quantityInStock > 10
                              ? 'bg-green-100 text-green-700'
                              : product.quantityInStock > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-600'
                          }`}>
                            {product.quantityInStock > 0 ? `${product.quantityInStock} left` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {(() => {
                            const reviews = product.reviews ?? [];
                            if (reviews.length === 0) return <span className="text-gray-400 text-xs">No ratings</span>;
                            const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                            return <span>⭐ {avg.toFixed(1)} <span className="text-xs text-gray-400">({reviews.length})</span></span>;
                          })()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/productimages/${product.id}`}
                              title="Manage images"
                              className="p-1.5 text-gray-400 hover:text-blue-500 transition">
                              <Image size={16} />
                            </Link>
                            <button onClick={() => setEditProduct(product)}
                              title="Edit product"
                              className="p-1.5 text-gray-400 hover:text-green-700 transition">
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              title="Delete product"
                              className="p-1.5 text-gray-400 hover:text-red-500 transition disabled:opacity-40">
                              {deletingId === product.id
                                ? <Loader2 size={16} className="animate-spin" />
                                : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && myProducts.length > 0 && (
              <div className="px-6 pb-4">
                <Pagination page={productsPage} totalPages={productsTotalPages} onChange={setProductsPage} />
              </div>
            )}
          </div>
        )}

        {/* Orders panel */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-green-900">Customer Orders ({totalOrders})</h2>
              {pendingOrders > 0 && (
                <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full font-medium">
                  {pendingOrders} pending
                </span>
              )}
            </div>

            {ordersError && (
              <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {ordersError}
              </div>
            )}

            <OrdersSection
              orders={vendorOrders}
              loading={ordersLoading}
              onAction={handleOrderAction}
            />
            {!ordersLoading && vendorOrders.length > 0 && (
              <div className="px-6 pb-4">
                <Pagination page={ordersPage} totalPages={ordersTotalPages} onChange={setOrdersPage} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onSave={handleSaved}
          onClose={() => setEditProduct(null)}
        />
      )}
    </MainLayout>
  );
};

export default VendorPage;
