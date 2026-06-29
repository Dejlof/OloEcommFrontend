// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { categories as categoriesApi, deliveryfee as deliveryFeeApi, auth, vendor as vendorApi, settlements as settlementsApi, returns as returnsApi } from '../api/api';
import { apiFetch } from '../api/api';
import { STATES, getCities } from '../utils/nigerianLocations';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import {
  Users, Tag, Trash2, Edit2, Loader2, X, Shield, Truck, Search, BarChart2,
  Store, ShieldCheck, ShieldAlert, ExternalLink, FileText, Landmark, Banknote,
  AlertCircle, CheckCircle2, RotateCcw, CircleDollarSign,
} from 'lucide-react';
import AdminAnalyticsPanel from '../components/AdminAnalyticsPanel';

const PAGE_SIZE = 10;

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition
        ${active
          ? 'bg-green-900 text-orange-100'
          : 'text-green-900 hover:bg-gray-100'}`}>
      <Icon size={16} /> {label}
    </button>
  );
}

// ── Search input ──────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700"
      />
    </div>
  );
}

// ── Categories panel ──────────────────────────────────────────────────────────
function CategoriesPanel() {
  const [list,       setList]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState({ name: '', description: '' });
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const load = (p = page, s = search) => {
    setLoading(true);
    categoriesApi.getAll({ search: s, pageNumber: p, pageSize: PAGE_SIZE })
      .then(d => {
        setList(d?.items ?? d ?? []);
        setTotalPages(d?.totalPages ?? 1);
        setTotalCount(d?.totalCount ?? (d?.items ?? d ?? []).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, search); }, [page, search]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setError(''); setSaving(true);
    try {
      if (editId) {
        await apiFetch(`/api/Category/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/Category', { method: 'POST', body: JSON.stringify(form) });
      }
      setForm({ name: '', description: '' });
      setEditId(null);
      load(1, search);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    confirmToast('Delete this category?', async () => {
      try {
        await apiFetch(`/api/Category/${id}`, { method: 'DELETE' });
        load(page, search);
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description ?? '' });
    setEditId(cat.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Form */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-900 mb-4">
            {editId ? 'Edit Category' : 'New Category'}
          </h3>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input name="name" value={form.name} onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '' }); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm font-semibold text-green-900">
            All Categories ({totalCount})
          </span>
          <div className="w-64">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search categories…" />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-400" size={28} /></div>
        ) : list.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No categories found.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {list.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-green-900 text-sm">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-green-700 transition"><Edit2 size={15}/></button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={15}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pb-4">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Users panel ───────────────────────────────────────────────────────────────
function UsersPanel() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [switchingId, setSwitchingId] = useState(null);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const load = (p = page, s = search) => {
    setLoading(true);
    auth.getUsers({ search: s, pageNumber: p, pageSize: PAGE_SIZE })
      .then(d => {
        setUsers(d?.items ?? d ?? []);
        setTotalPages(d?.totalPages ?? 1);
        setTotalCount(d?.totalCount ?? (d?.items ?? d ?? []).length);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, search); }, [page, search]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSwitchRole = (username, currentRole) => {
    const newRole = currentRole === 'Buyer' ? 'Vendor'
                  : currentRole === 'Vendor' ? 'Buyer' : currentRole;
    confirmToast(`Change ${username}'s role from ${currentRole} to ${newRole}?`, async () => {
      setSwitchingId(username);
      try {
        await apiFetch(`/api/account/switch-roles?username=${username}&newRole=${newRole}`, { method: 'POST' });
        setUsers(prev => prev.map(u => u.userName === username ? { ...u, role: newRole } : u));
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSwitchingId(null);
      }
    });
  };

  const handleDelete = (email) => {
    confirmToast(`Permanently delete user ${email}?`, async () => {
      try {
        await apiFetch(`/api/account/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
        load(page, search);
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const ROLE_COLOURS = {
    Admin:  'bg-purple-100 text-purple-700',
    Vendor: 'bg-blue-100   text-blue-700',
    Buyer:  'bg-green-100  text-green-700',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-semibold text-green-900 text-sm">
          All Users ({totalCount})
        </span>
        <div className="w-72">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or username…" />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-400" size={30}/></div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">No users found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide text-left">
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.email} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-green-900">
                      {user.firstName} {user.lastName}
                      <p className="text-xs text-gray-400 font-normal">@{user.userName}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{user.email}</td>
                    <td className="px-5 py-3 text-gray-600">{user.phoneNumber ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLOURS[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSwitchRole(user.userName, user.role)}
                          disabled={switchingId === user.userName}
                          title="Change role"
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition disabled:opacity-40">
                          {switchingId === user.userName
                            ? <Loader2 size={15} className="animate-spin" />
                            : <Shield size={15} />}
                        </button>
                        <button onClick={() => handleDelete(user.email)}
                          title="Delete user"
                          className="p-1.5 text-gray-400 hover:text-red-500 transition">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pb-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Delivery Fees panel ───────────────────────────────────────────────────────
const EMPTY_FEE = { state: '', city: '', fee: '' };

function DeliveryFeesPanel() {
  const [list,        setList]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form,        setForm]        = useState(EMPTY_FEE);
  const [editId,      setEditId]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity,  setFilterCity]  = useState('');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalCount,  setTotalCount]  = useState(0);

  const formCities   = getCities(form.state);
  const filterCities = getCities(filterState);

  const load = (p = page, state = filterState, city = filterCity) => {
    setLoading(true);
    const params = { pageNumber: p, pageSize: PAGE_SIZE };
    if (state) params.state = state;
    if (city)  params.city  = city;
    deliveryFeeApi.getfees(params)
      .then(d => {
        setList(d?.items ?? d ?? []);
        setTotalPages(d?.totalPages ?? 1);
        setTotalCount(d?.totalCount ?? (d?.items ?? d ?? []).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, filterState, filterCity); }, [page, filterState, filterCity]);

  const handleFilterState = (val) => {
    setFilterState(val);
    setFilterCity('');
    setPage(1);
  };

  const handleFilterCity = (val) => {
    setFilterCity(val);
    setPage(1);
  };

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {}),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.state.trim()) { setError('State is required.'); return; }
    if (!form.city.trim())  { setError('City is required.');  return; }
    if (!form.fee || isNaN(Number(form.fee)) || Number(form.fee) < 0) {
      setError('A valid fee is required.'); return;
    }
    setError(''); setSaving(true);
    const payload = { state: form.state, city: form.city, fee: Number(form.fee) };
    try {
      if (editId) {
        await deliveryFeeApi.update(editId, payload);
      } else {
        await deliveryFeeApi.create(payload);
      }
      setForm(EMPTY_FEE);
      setEditId(null);
      load(1, filterState, filterCity);
      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    confirmToast('Delete this delivery fee?', async () => {
      try {
        await deliveryFeeApi.delete(id);
        load(page, filterState, filterCity);
      } catch (err) {
        toast.error(err.message);
      }
    });
  };

  const openEdit = (fee) => {
    setForm({ state: fee.state, city: fee.city, fee: fee.fee });
    setEditId(fee.id);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Form */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-900 mb-4">
            {editId ? 'Edit Delivery Fee' : 'New Delivery Fee'}
          </h3>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <form onSubmit={handleSave} className="space-y-3">
            {/* State */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">State *</label>
              <select name="state" value={form.state} onChange={handle}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
                <option value="">— Select state —</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">City *</label>
              <select name="city" value={form.city} onChange={handle}
                disabled={!form.state}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white disabled:opacity-50">
                <option value="">— Select city —</option>
                {formCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Fee */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fee (₦) *</label>
              <input name="fee" type="number" min="0" step="any"
                value={form.fee} onChange={handle}
                placeholder="e.g. 1500"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FEE); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header + filters */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-green-900">
              All Delivery Fees ({totalCount})
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterState}
              onChange={e => handleFilterState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
              <option value="">All states</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterCity}
              onChange={e => handleFilterCity(e.target.value)}
              disabled={!filterState}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white disabled:opacity-50">
              <option value="">All cities</option>
              {filterCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(filterState || filterCity) && (
              <button
                onClick={() => { handleFilterState(''); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition flex items-center gap-1">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-orange-400" size={28} />
          </div>
        ) : list.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No delivery fees found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide text-left">
                    <th className="px-5 py-3">State</th>
                    <th className="px-5 py-3">City</th>
                    <th className="px-5 py-3">Fee</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {list.map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-green-900">{fee.state}</td>
                      <td className="px-5 py-3 text-gray-600">{fee.city}</td>
                      <td className="px-5 py-3 text-gray-800 font-semibold">₦{Number(fee.fee).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(fee)}
                            className="p-1.5 text-gray-400 hover:text-green-700 transition">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDelete(fee.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pb-4">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Vendor helpers ────────────────────────────────────────────────────────────
// Mirrors backend VendorStatus enum: Pending=0 UnderReview=1 Verified=2 Suspended=3 Rejected=4
const VENDOR_STATUS_MAP = {
  0: { label: 'Pending',      colour: 'bg-yellow-100 text-yellow-700' },
  1: { label: 'Under Review', colour: 'bg-blue-100 text-blue-700'     },
  2: { label: 'Verified',     colour: 'bg-green-100 text-green-700'   },
  3: { label: 'Suspended',    colour: 'bg-orange-100 text-orange-600' },
  4: { label: 'Rejected',     colour: 'bg-red-100 text-red-600'       },
};
const DOC_TYPE_MAP    = { 0: 'NIN', 1: 'Passport', 2: 'CAC', 3: 'TIN', 4: 'Utility Bill', 5: 'Business License' };
const DOC_STATUS_MAP  = {
  0: { label: 'Pending',      colour: 'bg-yellow-100 text-yellow-700' },
  1: { label: 'Under Review', colour: 'bg-blue-100 text-blue-700'     },
  2: { label: 'Verified',     colour: 'bg-green-100 text-green-700'   },
  3: { label: 'Rejected',     colour: 'bg-red-100 text-red-600'       },
};
const MEMBER_ROLE_MAP = { 0: 'Owner', 1: 'Initiator', 2: 'Approver' };

// ── Vendor detail modal ───────────────────────────────────────────────────────
function VendorDetailModal({ vendor, onClose, onVerify, onReject }) {
  const [rejectMode,    setRejectMode]    = useState(false);
  const [reason,        setReason]        = useState('');
  const [acting,        setActing]        = useState(false);
  const [docs,          setDocs]          = useState(vendor.documents ?? []);
  const [docActingId,   setDocActingId]   = useState(null);
  const [docRejectId,   setDocRejectId]   = useState(null);
  const [docRejectText, setDocRejectText] = useState('');
  const [debts,         setDebts]         = useState(null);
  const [debtsLoading,  setDebtsLoading]  = useState(true);
  const [debtsFilter,   setDebtsFilter]   = useState('outstanding');

  const loadDebts = (f) => {
    setDebtsLoading(true);
    const recovered = f === 'recovered' ? true : f === 'outstanding' ? false : undefined;
    vendorApi.getDebts(vendor.id, recovered)
      .then(data => setDebts(data ?? []))
      .catch(() => setDebts([]))
      .finally(() => setDebtsLoading(false));
  };

  useEffect(() => { loadDebts(debtsFilter); }, [vendor.id]);

  const handleDebtsFilter = (f) => { setDebtsFilter(f); loadDebts(f); };

  const fmtMoney = (n) => `₦${Number(n).toLocaleString()}`;

  const handleDocAction = async (docId, approved, rejectionReason = null) => {
    setDocActingId(docId);
    try {
      await vendorApi.verifyDocument(docId, approved, rejectionReason);
      setDocs(prev => prev.map(d =>
        d.id === docId
          ? { ...d, status: approved ? 1 : 2, rejectionReason: rejectionReason ?? null }
          : d
      ));
      toast.success(approved ? 'Document approved.' : 'Document rejected.');
      setDocRejectId(null);
      setDocRejectText('');
    } catch (err) {
      toast.error(err.message ?? 'Action failed.');
    } finally {
      setDocActingId(null);
    }
  };

  const handleVerify = async () => {
    setActing(true);
    await onVerify(vendor.id);
    setActing(false);
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setActing(true);
    await onReject(vendor.id, reason.trim());
    setActing(false);
    setRejectMode(false);
    setReason('');
  };

  const st = VENDOR_STATUS_MAP[vendor.status] ?? VENDOR_STATUS_MAP[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {vendor.logoUrl
              ? <img src={vendor.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Store size={18} className="text-gray-300" /></div>}
            <div>
              <h2 className="font-bold text-green-900">{vendor.businessName}</h2>
              <p className="text-xs text-gray-400">{vendor.businessEmail}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 transition"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Status + basic info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${st.colour}`}>{st.label}</span>
              {vendor.rejectionReason && (
                <span className="text-xs text-red-500">Reason: {vendor.rejectionReason}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                { label: 'Phone',    value: vendor.businessPhone },
                { label: 'Address', value: vendor.businessAddress },
                { label: 'Joined',  value: new Date(vendor.createdAt).toLocaleDateString() },
                { label: 'Verified At', value: vendor.verifiedAt ? new Date(vendor.verifiedAt).toLocaleDateString() : '—' },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="text-green-900 font-medium mt-0.5">{row.value || '—'}</p>
                </div>
              ))}
              {vendor.businessDescription && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Description</p>
                  <p className="text-green-900 mt-0.5">{vendor.businessDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <FileText size={13} /> Documents ({docs.length})
            </h3>
            {!docs.length ? (
              <p className="text-sm text-gray-400">No documents uploaded.</p>
            ) : (
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                {docs.map(doc => {
                  const ds = DOC_STATUS_MAP[doc.status] ?? DOC_STATUS_MAP[0];
                  const isPending  = doc.status < 2;
                  const isActing   = docActingId === doc.id;
                  const inReject   = docRejectId === doc.id;
                  return (
                    <div key={doc.id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">{DOC_TYPE_MAP[doc.type] ?? `Type ${doc.type}`}</p>
                          <p className="text-xs text-gray-400">#{doc.documentNumber}</p>
                          {doc.rejectionReason && <p className="text-xs text-red-500 mt-0.5">{doc.rejectionReason}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${ds.colour}`}>{ds.label}</span>
                          {doc.documentUrl && (
                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer"
                              title="View document"
                              className="p-1.5 text-gray-400 hover:text-green-700 transition">
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Per-document actions — only for pending */}
                      {isPending && !inReject && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDocAction(doc.id, true)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition">
                            {isActing ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />}
                            Approve
                          </button>
                          <button
                            onClick={() => setDocRejectId(doc.id)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition">
                            <ShieldAlert size={11} /> Reject
                          </button>
                        </div>
                      )}

                      {/* Inline rejection reason input */}
                      {isPending && inReject && (
                        <div className="space-y-1.5">
                          <input
                            value={docRejectText}
                            onChange={e => setDocRejectText(e.target.value)}
                            placeholder="Rejection reason…"
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDocAction(doc.id, false, docRejectText)}
                              disabled={isActing || !docRejectText.trim()}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                              {isActing && <Loader2 size={11} className="animate-spin" />}
                              Confirm
                            </button>
                            <button
                              onClick={() => { setDocRejectId(null); setDocRejectText(''); }}
                              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bank accounts */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Landmark size={13} /> Bank Accounts ({vendor.bankAccounts?.length ?? 0})
            </h3>
            {!vendor.bankAccounts?.length ? (
              <p className="text-sm text-gray-400">No bank accounts added.</p>
            ) : (
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                {vendor.bankAccounts.map(acc => (
                  <div key={acc.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-green-900">{acc.bankName}</p>
                      <p className="text-xs text-gray-400">{acc.accountName} — {acc.accountNumber}</p>
                    </div>
                    {acc.isPrimary && (
                      <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Debts */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <AlertCircle size={13} /> Debts
            </h3>
            <div className="flex gap-2 mb-3">
              {[
                { key: 'outstanding', label: 'Outstanding' },
                { key: 'recovered',   label: 'Recovered'   },
                { key: 'all',         label: 'All'          },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => handleDebtsFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                    debtsFilter === key
                      ? 'bg-green-900 text-orange-100 border-green-900'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            {debtsLoading ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-orange-400" /></div>
            ) : !debts?.length ? (
              <p className="text-sm text-gray-400">No {debtsFilter === 'all' ? '' : debtsFilter} debts.</p>
            ) : (
              <>
                {debtsFilter !== 'recovered' && (
                  <div className="mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-red-600 font-medium">Total outstanding</span>
                    <span className="text-sm font-bold text-red-700">
                      {fmtMoney(debts.reduce((s, d) => s + d.amount, 0))}
                    </span>
                  </div>
                )}
                <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {debts.map(d => (
                    <div key={d.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {d.productName ?? `Order #${d.orderDetailId}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </p>
                          {d.reason && <p className="text-xs text-gray-500 mt-0.5">{d.reason}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-red-700">{fmtMoney(d.amount)}</span>
                          {d.isRecovered ? (
                            <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Recovered</span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 bg-red-100 text-red-600 rounded-full">Outstanding</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Team members */}
          <div>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Users size={13} /> Team Members ({vendor.members?.length ?? 0})
            </h3>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              {vendor.members?.map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-green-900">{m.userFullName}</p>
                    <p className="text-xs text-gray-400">{m.userEmail}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">
                    {MEMBER_ROLE_MAP[m.role] ?? `Role ${m.role}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verify / Reject — for Pending=0 or UnderReview=1 */}
          {(vendor.status === 0 || vendor.status === 1) && (
            <div className="pt-2 border-t border-gray-100">
              {rejectMode ? (
                <div className="space-y-2">
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    placeholder="Enter rejection reason…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleReject} disabled={acting || !reason.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition">
                      {acting && <Loader2 size={14} className="animate-spin" />}
                      Confirm Rejection
                    </button>
                    <button onClick={() => { setRejectMode(false); setReason(''); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleVerify} disabled={acting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
                    {acting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Verify Vendor
                  </button>
                  <button onClick={() => setRejectMode(true)} disabled={acting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 transition">
                    <ShieldAlert size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Debt modal ────────────────────────────────────────────────────────────
const EMPTY_DEBT = { orderDetailId: '', amount: '', reason: '' };

function AddDebtModal({ vendor, onClose, onSaved }) {
  const [form,          setForm]          = useState(EMPTY_DEBT);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');
  const [earnings,      setEarnings]      = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(true);

  useEffect(() => {
    vendorApi.getEarnings(vendor.id)
      .then(data => setEarnings(data ?? []))
      .catch(() => setEarnings([]))
      .finally(() => setEarningsLoading(false));
  }, [vendor.id]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSelectEarning = (e) => {
    const earning = earnings.find(r => String(r.orderDetailId) === e.target.value);
    if (!earning) { setForm(f => ({ ...f, orderDetailId: '', amount: '' })); return; }
    setForm(f => ({
      ...f,
      orderDetailId: String(earning.orderDetailId),
      amount:        String(earning.netAmount),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orderDetailId || isNaN(Number(form.orderDetailId))) {
      setError('Select an order or enter an Order Detail ID.'); return;
    }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('A valid amount is required.'); return;
    }
    if (!form.reason.trim()) { setError('Reason is required.'); return; }
    setError(''); setSaving(true);
    try {
      await settlementsApi.addDebt(vendor.id, {
        orderDetailId: Number(form.orderDetailId),
        amount:        Number(form.amount),
        reason:        form.reason.trim(),
      });
      toast.success(`Debt of ₦${Number(form.amount).toLocaleString()} added for ${vendor.businessName}.`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message ?? 'Failed to add debt.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEarning = earnings.find(r => String(r.orderDetailId) === form.orderDetailId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-green-900">Add Debt</h2>
            <p className="text-xs text-gray-400 mt-0.5">{vendor.businessName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-500 text-xs">{error}</p>}

          {/* Order picker from delivered earnings */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Select Delivered Order</label>
            {earningsLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 size={13} className="animate-spin" /> Loading orders…
              </div>
            ) : earnings.length === 0 ? (
              <p className="text-xs text-gray-400 py-1">No delivered orders found for this vendor.</p>
            ) : (
              <select
                value={form.orderDetailId}
                onChange={handleSelectEarning}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
                <option value="">— Pick an order —</option>
                {earnings.map(r => (
                  <option key={r.orderDetailId} value={r.orderDetailId}>
                    #{r.orderDetailId} — {r.orderDetail?.productName ?? `Order Detail ${r.orderDetailId}`} — ₦{Number(r.grossAmount).toLocaleString()}
                    {r.isSettled ? ' (settled)' : ''}
                  </option>
                ))}
              </select>
            )}
            {selectedEarning && (
              <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 space-y-0.5">
                <p>Net amount: <span className="font-medium text-green-700">₦{Number(selectedEarning.netAmount).toLocaleString()}</span></p>
                <p>Earned: {new Date(selectedEarning.earnedAt).toLocaleDateString()}</p>
                {selectedEarning.isSettled && <p className="text-orange-500">Already settled</p>}
              </div>
            )}
          </div>

          {/* Amount — pre-filled from earning, editable */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Debt Amount (₦) *</label>
            <input
              name="amount"
              type="number"
              min="1"
              step="any"
              value={form.amount}
              onChange={handle}
              placeholder="e.g. 5000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason *</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handle}
              rows={3}
              placeholder="e.g. Item returned by buyer — refund deducted from vendor earnings"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Add Debt
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Vendors panel ─────────────────────────────────────────────────────────────
function VendorsPanel() {
  const [vendors,      setVendors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [selected,     setSelected]     = useState(null);
  const [debtTarget,   setDebtTarget]   = useState(null);

  const load = (p = page, s = search) => {
    setLoading(true);
    const params = { pageNumber: p, pageSize: PAGE_SIZE };
    if (s) params.search = s;
    vendorApi.getAll(params)
      .then(d => {
        setVendors(d?.items ?? []);
        setTotalPages(d?.totalPages ?? 1);
        setTotalCount(d?.totalCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, search); }, [page, search]);

  const handleSearch = val => { setSearch(val); setPage(1); };
  const handleStatus = val => { setStatusFilter(val); };

  const displayVendors = statusFilter !== ''
    ? vendors.filter(v => v.status === parseInt(statusFilter, 10))
    : vendors;

  const handleVerify = async (id) => {
    try {
      await vendorApi.updateStatus(id, 2); // Verified=2
      const patch = v => v.id === id ? { ...v, status: 2 } : v;
      setVendors(prev => prev.map(patch));
      setSelected(s => s?.id === id ? { ...s, status: 2 } : s);
      toast.success('Vendor verified.');
    } catch (err) {
      toast.error(err.message ?? 'Verification failed.');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await vendorApi.updateStatus(id, 4, reason); // Rejected=4
      const patch = v => v.id === id ? { ...v, status: 4, rejectionReason: reason } : v;
      setVendors(prev => prev.map(patch));
      setSelected(s => s?.id === id ? { ...s, status: 4, rejectionReason: reason } : s);
      toast.success('Vendor rejected.');
    } catch (err) {
      toast.error(err.message ?? 'Rejection failed.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header + filters */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-semibold text-green-900 text-sm">All Vendors ({totalCount})</span>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
            <option value="">All statuses</option>
            <option value="0">Pending</option>
            <option value="1">Under Review</option>
            <option value="2">Verified</option>
            <option value="3">Suspended</option>
            <option value="4">Rejected</option>
          </select>
          <div className="w-64">
            <SearchBar value={search} onChange={handleSearch} placeholder="Search vendors…" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-400" size={30} /></div>
      ) : displayVendors.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-12">No vendors found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide text-left">
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Docs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayVendors.map(v => {
                  const vs = VENDOR_STATUS_MAP[v.status] ?? VENDOR_STATUS_MAP[0];
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {v.logoUrl
                            ? <img src={v.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            : <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center"><Store size={14} className="text-gray-300" /></div>}
                          <span className="font-medium text-green-900">{v.businessName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{v.businessEmail}</td>
                      <td className="px-5 py-3 text-gray-600">{v.businessPhone || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{v.documents?.length ?? 0}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${vs.colour}`}>{vs.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelected(v)}
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:border-green-700 hover:text-green-700 transition">
                            View
                          </button>
                          <button onClick={() => setDebtTarget(v)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center gap-1">
                            <AlertCircle size={12} /> Add Debt
                          </button>
                          {(v.status === 0 || v.status === 1) && (
                            <button onClick={() => handleVerify(v.id)}
                              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-1">
                              <ShieldCheck size={12} /> Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pb-4">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}

      {selected && (
        <VendorDetailModal
          vendor={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
      {debtTarget && (
        <AddDebtModal
          vendor={debtTarget}
          onClose={() => setDebtTarget(null)}
          onSaved={() => load(page, search)}
        />
      )}
    </div>
  );
}

// ── Settlements panel ─────────────────────────────────────────────────────────
function SettlementsPanel() {
  const [vendors,       setVendors]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [settlingId,    setSettlingId]    = useState(null);
  const [processingAll, setProcessingAll] = useState(false);

  const load = () => {
    setLoading(true);
    settlementsApi.getEligibleVendors()
      .then(data => setVendors(data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSettle = (vendorId, businessName) => {
    confirmToast(`Process settlement for ${businessName}?`, async () => {
      setSettlingId(vendorId);
      try {
        await settlementsApi.settle(vendorId);
        toast.success(`Settlement processed for ${businessName}.`);
        load();
      } catch (err) {
        toast.error(err.message ?? 'Settlement failed.');
      } finally {
        setSettlingId(null);
      }
    });
  };

  const handleProcessAll = () => {
    confirmToast(`Process settlements for all ${vendors.length} eligible vendors?`, async () => {
      setProcessingAll(true);
      try {
        await settlementsApi.processAll();
        toast.success('All settlements processed successfully.');
        load();
      } catch (err) {
        toast.error(err.message ?? 'Bulk settlement failed.');
      } finally {
        setProcessingAll(false);
      }
    });
  };

  const fmt = (n) => `₦${Number(n).toLocaleString()}`;
  const fmtDate = (iso) => new Date(iso).toLocaleDateString();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <span className="font-semibold text-green-900 text-sm">
          Eligible Vendors for Settlement ({vendors.length})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            <Banknote size={13} /> Refresh
          </button>
          {vendors.length > 0 && (
            <button
              onClick={handleProcessAll}
              disabled={processingAll}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-900 text-orange-100 rounded-lg hover:bg-green-800 disabled:opacity-50 transition">
              {processingAll ? <Loader2 size={13} className="animate-spin" /> : <Banknote size={13} />}
              Process All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-400" size={30} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-12 text-red-500 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-gray-400 text-sm">
          <CheckCircle2 size={28} className="text-green-300" />
          No vendors eligible for settlement right now.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide text-left">
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Earnings</th>
                <th className="px-5 py-3">Gross</th>
                <th className="px-5 py-3">Debt</th>
                <th className="px-5 py-3">Net Payable</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3">Oldest Delivery</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendors.map(v => (
                <tr key={v.vendorId} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-green-900">{v.businessName}</td>
                  <td className="px-5 py-3 text-gray-600">{v.earningsCount}</td>
                  <td className="px-5 py-3 text-gray-800">{fmt(v.grossEarnings)}</td>
                  <td className="px-5 py-3 text-red-500">{fmt(v.outstandingDebt)}</td>
                  <td className="px-5 py-3 font-semibold text-green-700">{fmt(v.netPayable)}</td>
                  <td className="px-5 py-3">
                    {v.hasVerifiedBankAccount ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-orange-500 text-xs">
                        <AlertCircle size={13} /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(v.oldestEligibleDeliveryDate)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleSettle(v.vendorId, v.businessName)}
                      disabled={!v.hasVerifiedBankAccount || settlingId === v.vendorId}
                      title={!v.hasVerifiedBankAccount ? 'Vendor has no verified bank account' : ''}
                      className="flex items-center gap-1.5 ml-auto text-xs px-3 py-1.5 bg-green-900 text-orange-100 rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                      {settlingId === v.vendorId
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Banknote size={12} />}
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Returns panel ─────────────────────────────────────────────────────────────
const RETURN_STATUS_LABELS  = { 0: 'Pending', 1: 'Under Review', 2: 'Approved', 3: 'Rejected', 4: 'Item Received', 5: 'Refunded' };
const RETURN_STATUS_COLOURS = {
  0: 'bg-yellow-100 text-yellow-700',
  1: 'bg-blue-100   text-blue-700',
  2: 'bg-green-100  text-green-700',
  3: 'bg-red-100    text-red-600',
  4: 'bg-purple-100 text-purple-700',
  5: 'bg-emerald-100 text-emerald-700',
};
const RETURN_REASON_LABELS = {
  0: 'Defective Item', 1: 'Wrong Item Received',
  2: 'Item Not as Described', 3: 'Damaged in Shipping', 4: 'Changed Mind',
};

function ReturnStatusBadge({ status }) {
  const k = typeof status === 'string' ? parseInt(status, 10) : status;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${RETURN_STATUS_COLOURS[k] ?? 'bg-gray-100 text-gray-600'}`}>
      {RETURN_STATUS_LABELS[k] ?? status}
    </span>
  );
}

function ApproverReviewModal({ ret, onClose, onDone }) {
  const [approve, setApprove]     = useState(true);
  const [reason, setReason]       = useState('');
  const [saving, setSaving]       = useState(false);

  const handleSubmit = async () => {
    if (!approve && !reason.trim()) { toast.error('Please provide a rejection reason.'); return; }
    setSaving(true);
    try {
      await returnsApi.approverReview(ret.id, { approve, rejectionReason: approve ? '' : reason });
      toast.success(approve ? 'Return approved.' : 'Return rejected.');
      onDone(); onClose();
    } catch (err) {
      toast.error(err.message ?? 'Failed to submit review.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-green-900">Review Return — {ret.productName}</h3>

        {ret.initiatorNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            <span className="font-semibold">Initiator notes: </span>{ret.initiatorNotes}
          </div>
        )}

        <div className="flex gap-3">
          {[{ val: true, label: 'Approve' }, { val: false, label: 'Reject' }].map(opt => (
            <button key={String(opt.val)} type="button" onClick={() => setApprove(opt.val)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                approve === opt.val
                  ? opt.val ? 'bg-green-900 text-orange-100 border-green-900' : 'bg-red-600 text-white border-red-600'
                  : 'border-gray-300 text-gray-500 hover:border-gray-400'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>

        {!approve && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rejection Reason *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Explain why this return is being rejected…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={handleSubmit} disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm disabled:opacity-50 transition ${
              approve ? 'bg-green-900 text-orange-100 hover:bg-green-800' : 'bg-red-600 text-white hover:bg-red-700'
            }`}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Submitting…' : approve ? 'Confirm Approval' : 'Confirm Rejection'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnsPanel() {
  const [returnList, setReturnList]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  const load = () => {
    setLoading(true);
    returnsApi.getAll()
      .then(data => setReturnList(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleProcessRefund = (r) => {
    confirmToast(`Process refund of ₦${Number(r.refundAmount).toLocaleString()} for ${r.productName}?`, async () => {
      setRefundingId(r.id);
      try {
        await returnsApi.processRefund(r.id);
        toast.success('Refund processed successfully.');
        load();
      } catch (err) {
        toast.error(err.message ?? 'Failed to process refund.');
      } finally {
        setRefundingId(null);
      }
    });
  };

  const statusNum = r => typeof r.status === 'string' ? parseInt(r.status, 10) : r.status;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-400" size={32} /></div>;

  if (returnList.length === 0) return (
    <div className="flex flex-col items-center py-20 text-center">
      <RotateCcw size={48} className="text-orange-200 mb-4" />
      <p className="text-gray-500">No return requests found.</p>
    </div>
  );

  const pending   = returnList.filter(r => statusNum(r) < 5).length;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-green-900">All Return Requests ({returnList.length})</h2>
          {pending > 0 && (
            <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full font-medium">
              {pending} active
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Refund</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returnList.map(r => {
                const s = statusNum(r);
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-green-900">{r.productName}</p>
                      {r.additionalNotes && (
                        <p className="text-xs text-gray-400 mt-0.5 italic truncate max-w-[180px]">"{r.additionalNotes}"</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{RETURN_REASON_LABELS[r.reason] ?? r.reason}</td>
                    <td className="px-5 py-3 font-semibold text-green-900">₦{Number(r.refundAmount).toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(r.requestedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <ReturnStatusBadge status={r.status} />
                      {r.rejectionReason && <p className="text-xs text-red-500 mt-1">{r.rejectionReason}</p>}
                      {r.refundReference  && <p className="text-xs text-gray-400 mt-1">Ref: {r.refundReference}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1.5">
                        {/* Admin can approve/reject Pending or InitiatorRecommended */}
                        {(s === 0 || s === 1) && (
                          <button onClick={() => setReviewModal(r)}
                            className="px-3 py-1.5 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition whitespace-nowrap">
                            Approve / Reject
                          </button>
                        )}
                        {/* Process refund once item is received */}
                        {s === 4 && (
                          <button onClick={() => handleProcessRefund(r)} disabled={refundingId === r.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition whitespace-nowrap">
                            {refundingId === r.id
                              ? <Loader2 size={11} className="animate-spin" />
                              : <CircleDollarSign size={11} />}
                            Process Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModal && (
        <ApproverReviewModal ret={reviewModal} onClose={() => setReviewModal(null)} onDone={load} />
      )}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',        label: 'Users',        icon: Users      },
  { id: 'vendors',      label: 'Vendors',      icon: Store      },
  { id: 'categories',   label: 'Categories',   icon: Tag        },
  { id: 'deliveryfees', label: 'Delivery Fees', icon: Truck     },
  { id: 'settlements',  label: 'Settlements',  icon: Banknote   },
  { id: 'returns',      label: 'Returns',      icon: RotateCcw  },
  { id: 'analytics',    label: 'Analytics',    icon: BarChart2  },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <MainLayout>
      <div className="w-[90%] m-auto py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-green-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users, categories and platform settings</p>
        </div>

        {/* Tab row */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(t => (
            <Tab key={t.id} label={t.label} icon={t.icon}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)} />
          ))}
        </div>

        {activeTab === 'users'        && <UsersPanel />}
        {activeTab === 'vendors'      && <VendorsPanel />}
        {activeTab === 'categories'   && <CategoriesPanel />}
        {activeTab === 'deliveryfees' && <DeliveryFeesPanel />}
        {activeTab === 'settlements'  && <SettlementsPanel />}
        {activeTab === 'returns'      && <ReturnsPanel />}
        {activeTab === 'analytics'    && <AdminAnalyticsPanel />}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
