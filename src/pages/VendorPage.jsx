import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { products as productsApi, categories as categoriesApi, orders as ordersApi, vendor as vendorApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  Package, Plus, Trash2, Edit2, Image, Loader2,
  ShoppingBag, AlertCircle, ClipboardList,
  Truck, CheckCircle, XCircle, Star, BarChart2, Layers, Send,
} from 'lucide-react';
import VendorAnalyticsPanel  from '../components/VendorAnalyticsPanel';
import VendorSettingsPanel   from '../components/VendorSettingsPanel';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import Pagination from '../components/Pagination';

// ── Product status (mirrors backend ProductStatus enum) ───────────────────────
// Draft=0  PendingApproval=1  Active=2  Rejected=3  PendingDeletion=4
const PRODUCT_STATUS = {
  0: { label: 'Draft',            colour: 'bg-gray-100 text-gray-600'      },
  1: { label: 'Pending Approval', colour: 'bg-yellow-100 text-yellow-700'  },
  2: { label: 'Active',           colour: 'bg-green-100 text-green-700'    },
  3: { label: 'Rejected',         colour: 'bg-red-100 text-red-600'        },
  4: { label: 'Pending Deletion', colour: 'bg-orange-100 text-orange-600'  },
};

// Normalise: API may return integer OR string enum name
const STATUS_STR_TO_NUM = { Draft: 0, PendingApproval: 1, Active: 2, Rejected: 3, PendingDeletion: 4 };
const toStatusNum = s => typeof s === 'number' ? s : (STATUS_STR_TO_NUM[s] ?? -1);

function ProductStatusBadge({ status }) {
  const n   = toStatusNum(status);
  const cfg = PRODUCT_STATUS[n] ?? { label: String(status ?? '—'), colour: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.colour}`}>
      {cfg.label}
    </span>
  );
}

// ── Reject reason modal ───────────────────────────────────────────────────────
function RejectModal({ title, onConfirm, onClose }) {
  const [reason,  setReason]  = useState('');
  const [acting,  setActing]  = useState(false);

  const handleConfirm = async () => {
    setActing(true);
    await onConfirm(reason.trim() || undefined);
    setActing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-semibold text-green-900">{title}</h3>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason (optional)…"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
        />
        <div className="flex gap-3">
          <button onClick={handleConfirm} disabled={acting}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
            {acting && <Loader2 size={14} className="animate-spin" />}
            Confirm
          </button>
          <button onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

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

// ── Variants modal (add + edit) ───────────────────────────────────────────────
const EMPTY_VARIANT = { size: '', color: '', sku: '', quantityInStock: '', priceOverride: '' };

const INPUT_CLS = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700';

function variantToForm(v) {
  return {
    size:            v.size            ?? '',
    color:           v.color           ?? '',
    sku:             v.sku             ?? '',
    quantityInStock: v.quantityInStock ?? '',
    priceOverride:   v.priceOverride   ?? '',
  };
}

function VariantFields({ form, onChange }) {
  const handle = e => onChange(f => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'size',          label: 'Size',               type: 'text'   },
          { name: 'color',         label: 'Color',              type: 'text'   },
          { name: 'sku',           label: 'SKU',                type: 'text'   },
          { name: 'priceOverride', label: 'Price Override (₦)', type: 'number' },
        ].map(f => (
          <div key={f.name}>
            <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
            <input name={f.name} type={f.type} value={form[f.name]} onChange={handle} className={INPUT_CLS} />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label className="block text-xs text-gray-500 mb-1">Quantity in Stock <span className="text-red-400">*</span></label>
        <input name="quantityInStock" type="number" min="0" value={form.quantityInStock} onChange={handle} className={INPUT_CLS} />
      </div>
    </>
  );
}

function VariantsModal({ product, onClose }) {
  const [variants,     setVariants]     = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);
  const [editingId,    setEditingId]    = useState(null);
  const [editForm,     setEditForm]     = useState(EMPTY_VARIANT);
  const [addForm,      setAddForm]      = useState(EMPTY_VARIANT);
  const [saving,       setSaving]       = useState(false);
  const [deletingVId,  setDeletingVId]  = useState(null);
  const [error,        setError]        = useState('');

  useEffect(() => {
    productsApi.getVariants(product.id)
      .then(data => setVariants(Array.isArray(data) ? data : []))
      .catch(() => setVariants([]))
      .finally(() => setLoadingList(false));
  }, [product.id]);

  const startEdit = (v) => { setEditingId(v.id); setEditForm(variantToForm(v)); setError(''); };
  const cancelEdit = () => { setEditingId(null); setError(''); };

  const handleDeleteVariant = async (variantId) => {
    setDeletingVId(variantId);
    try {
      await productsApi.deleteVariant(product.id, variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success('Variant deleted.');
    } catch (err) {
      toast.error(err.message ?? 'Failed to delete variant.');
    } finally {
      setDeletingVId(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    if (!editForm.quantityInStock) { setError('Quantity is required.'); return; }
    setSaving(true);
    try {
      const updated = await productsApi.updateVariant(product.id, editingId, {
        size:            editForm.size            || undefined,
        color:           editForm.color           || undefined,
        sku:             editForm.sku             || undefined,
        quantityInStock: parseInt(editForm.quantityInStock, 10),
        priceOverride:   editForm.priceOverride   ? parseFloat(editForm.priceOverride) : undefined,
      });
      setVariants(prev => prev.map(v => v.id === editingId ? (updated ?? { ...v, ...editForm }) : v));
      toast.success('Variant updated.');
      setEditingId(null);
    } catch (err) {
      setError(err.message ?? 'Failed to update variant.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!addForm.quantityInStock) { setError('Quantity is required.'); return; }
    setSaving(true);
    try {
      const created = await productsApi.addVariant(product.id, {
        size:            addForm.size            || undefined,
        color:           addForm.color           || undefined,
        sku:             addForm.sku             || undefined,
        quantityInStock: parseInt(addForm.quantityInStock, 10),
        priceOverride:   addForm.priceOverride   ? parseFloat(addForm.priceOverride) : undefined,
      });
      setVariants(prev => [...prev, created]);
      toast.success('Variant added.');
      setAddForm(EMPTY_VARIANT);
    } catch (err) {
      setError(err.message ?? 'Failed to add variant.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-green-900 mb-1">Variants</h2>
        <p className="text-xs text-gray-400 mb-4">{product.name}</p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* ── Existing variants ── */}
        {loadingList ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin text-orange-400" size={24} /></div>
        ) : variants.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Existing Variants</p>
            {variants.map(v => (
              <div key={v.id} className="border border-gray-200 rounded-xl p-4">
                {editingId === v.id ? (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    <VariantFields form={editForm} onChange={setEditForm} />
                    <div className="flex gap-2 pt-1">
                      <button type="submit" disabled={saving}
                        className="flex-1 py-2 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 disabled:opacity-50 transition">
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEdit}
                        className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-green-900">
                      {v.size  && <span><span className="text-xs text-gray-400">Size </span>{v.size}</span>}
                      {v.color && <span><span className="text-xs text-gray-400">Color </span>{v.color}</span>}
                      {v.sku   && <span><span className="text-xs text-gray-400">SKU </span>{v.sku}</span>}
                      <span><span className="text-xs text-gray-400">Qty </span>{v.quantityInStock}</span>
                      {v.priceOverride && <span><span className="text-xs text-gray-400">Price </span>₦{Number(v.priceOverride).toLocaleString()}</span>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(v)}
                        className="p-1.5 text-gray-400 hover:text-green-700 transition" title="Edit variant">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDeleteVariant(v.id)}
                        disabled={deletingVId === v.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition disabled:opacity-40" title="Delete variant">
                        {deletingVId === v.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Add new variant ── */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Add New Variant</p>
        <form onSubmit={handleAdd} className="space-y-3">
          <VariantFields form={addForm} onChange={setAddForm} />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? 'Adding…' : 'Add Variant'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
              Done
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
  const [variantProduct,   setVariantProduct]   = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [error,            setError]            = useState('');
  const [ordersError,      setOrdersError]      = useState('');
  const [vendorRole,       setVendorRole]       = useState(null); // 0=Owner 1=Initiator 2=Approver
  const [submittingId,     setSubmittingId]     = useState(null);
  const [approvingId,      setApprovingId]      = useState(null);
  const [rejectModal,      setRejectModal]      = useState(null); // { id, type: 'approval'|'deletion' }

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

  // Resolve current user's role within this vendor team (same approach as VendorSettingsPanel)
  useEffect(() => {
    if (!user?.id) return;
    vendorApi.getMine()
      .then(data => {
        const members = data?.members ?? [];
        const mine = members.find(m => m.userId === user.id);
        if (mine != null) setVendorRole(mine.role ?? null);
      })
      .catch(() => {});
  }, [user?.id]);

  const handleDelete = (id) => {
    if (vendorRole === 1) {
      // Initiator: request deletion (moves to PendingDeletion=4)
      confirmToast('Request deletion of this product?', async () => {
        setDeletingId(id);
        try {
          await productsApi.requestDelete(id);
          setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 4 } : p));
          toast.success('Deletion requested — awaiting approval.');
        } catch (err) {
          toast.error(err.message);
        } finally {
          setDeletingId(null);
        }
      });
    } else {
      // Owner (or unknown): direct delete
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
    }
  };

  const handleSubmitProduct = async (id) => {
    setSubmittingId(id);
    try {
      await productsApi.submit(id);
      setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 1 } : p)); // PendingApproval
      toast.success('Product submitted for approval.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleApproveProduct = async (id) => {
    setApprovingId(id);
    try {
      await productsApi.approve(id);
      setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 2 } : p)); // Active
      toast.success('Product approved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveDeletion = async (id) => {
    setApprovingId(id);
    try {
      await productsApi.approve(id);
      setMyProducts(prev => prev.filter(p => p.id !== id));
      setStatsProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Deletion approved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    const { id, type } = rejectModal;
    try {
      await productsApi.reject(id, reason);
      if (type === 'approval') {
        setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 3 } : p)); // Rejected
        toast.success('Product rejected.');
      } else {
        setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: 2 } : p)); // Active
        toast.success('Deletion rejected — product restored to Active.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRejectModal(null);
    }
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
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
          {[
            { key: 'products',  label: 'Products',  count: totalProducts },
            { key: 'orders',    label: 'Orders',    count: totalOrders   },
            { key: 'analytics', label: 'Analytics', count: null          },
            { key: 'settings',  label: 'Settings',  count: null          },
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
              {tab.count !== null && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${
                  activeTab === tab.key ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
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
                      <th className="px-5 py-3">Status</th>
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
                        <td className="px-5 py-4">
                          <ProductStatusBadge status={product.status} />
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

                            {/* Images — hidden for Approver */}
                            {vendorRole !== 2 && (
                              <Link to={`/productimages/${product.id}`} title="Manage images"
                                className="p-1.5 text-gray-400 hover:text-blue-500 transition">
                                <Image size={16} />
                              </Link>
                            )}

                            {/* Variants — Owner always; Initiator only when not locked */}
                            {(vendorRole === 0 || (vendorRole !== 2 && toStatusNum(product.status) !== 1 && toStatusNum(product.status) !== 4)) && (
                              <button onClick={() => setVariantProduct(product)} title="Manage variants"
                                className="p-1.5 text-gray-400 hover:text-purple-500 transition">
                                <Layers size={16} />
                              </button>
                            )}

                            {/* Edit — Owner/Initiator when not locked (Draft=0, Rejected=3 allowed) */}
                            {vendorRole !== 2 && toStatusNum(product.status) !== 1 && toStatusNum(product.status) !== 4 && (
                              <button onClick={() => setEditProduct(product)} title="Edit product"
                                className="p-1.5 text-gray-400 hover:text-green-700 transition">
                                <Edit2 size={16} />
                              </button>
                            )}

                            {/* Submit for approval — Initiator, Draft=0 or Rejected=3 */}
                            {vendorRole === 1 && (toStatusNum(product.status) === 0 || toStatusNum(product.status) === 3) && (
                              <button onClick={() => handleSubmitProduct(product.id)}
                                disabled={submittingId === product.id}
                                title="Submit for approval"
                                className="p-1.5 text-gray-400 hover:text-orange-500 transition disabled:opacity-40">
                                {submittingId === product.id
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Send size={16} />}
                              </button>
                            )}

                            {/* Approve product — Owner/Approver, PendingApproval=1 */}
                            {(vendorRole === 0 || vendorRole === 2) && toStatusNum(product.status) === 1 && (
                              <button onClick={() => handleApproveProduct(product.id)}
                                disabled={approvingId === product.id}
                                title="Approve product"
                                className="p-1.5 text-gray-400 hover:text-green-600 transition disabled:opacity-40">
                                {approvingId === product.id
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <CheckCircle size={16} />}
                              </button>
                            )}

                            {/* Reject product — Owner/Approver, PendingApproval=1 */}
                            {(vendorRole === 0 || vendorRole === 2) && toStatusNum(product.status) === 1 && (
                              <button onClick={() => setRejectModal({ id: product.id, type: 'approval' })}
                                title="Reject product"
                                className="p-1.5 text-gray-400 hover:text-red-500 transition">
                                <XCircle size={16} />
                              </button>
                            )}

                            {/* Approve deletion — Owner/Approver, PendingDeletion=4 */}
                            {(vendorRole === 0 || vendorRole === 2) && toStatusNum(product.status) === 4 && (
                              <button onClick={() => handleApproveDeletion(product.id)}
                                disabled={approvingId === product.id}
                                title="Approve deletion"
                                className="p-1.5 text-gray-400 hover:text-red-600 transition disabled:opacity-40">
                                {approvingId === product.id
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Trash2 size={16} />}
                              </button>
                            )}

                            {/* Reject deletion (restore to Active=2) — Owner/Approver, PendingDeletion=4 */}
                            {(vendorRole === 0 || vendorRole === 2) && toStatusNum(product.status) === 4 && (
                              <button onClick={() => setRejectModal({ id: product.id, type: 'deletion' })}
                                title="Reject deletion — restore product"
                                className="p-1.5 text-gray-400 hover:text-green-600 transition">
                                <CheckCircle size={16} />
                              </button>
                            )}

                            {/* Delete / Request-delete — not Approver, not when pending (1 or 4) */}
                            {vendorRole !== 2 && toStatusNum(product.status) !== 1 && toStatusNum(product.status) !== 4 && (
                              <button onClick={() => handleDelete(product.id)}
                                disabled={deletingId === product.id}
                                title={vendorRole === 1 ? 'Request deletion' : 'Delete product'}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition disabled:opacity-40">
                                {deletingId === product.id
                                  ? <Loader2 size={16} className="animate-spin" />
                                  : <Trash2 size={16} />}
                              </button>
                            )}

                            {/* Placeholder when Approver has nothing to act on */}
                            {vendorRole === 2 && toStatusNum(product.status) !== 1 && toStatusNum(product.status) !== 4 && (
                              <span className="text-xs text-gray-300 select-none">—</span>
                            )}
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

        {/* Analytics panel */}
        {activeTab === 'analytics' && <VendorAnalyticsPanel />}

        {/* Settings panel */}
        {activeTab === 'settings' && <VendorSettingsPanel />}

      </div>

      {/* Variants modal */}
      {variantProduct && (
        <VariantsModal
          product={variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}

      {/* Edit modal */}
      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onSave={handleSaved}
          onClose={() => setEditProduct(null)}
        />
      )}

      {/* Reject modal */}
      {rejectModal && (
        <RejectModal
          title={
            rejectModal.type === 'approval'
              ? 'Reject product — it will return to Draft'
              : 'Reject deletion — product will be restored to Active'
          }
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectModal(null)}
        />
      )}
    </MainLayout>
  );
};

export default VendorPage;
