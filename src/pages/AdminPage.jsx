// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { categories as categoriesApi, deliveryfee as deliveryFeeApi, auth, vendor as vendorApi } from '../api/api';
import { apiFetch } from '../api/api';
import { STATES, getCities } from '../utils/nigerianLocations';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import {
  Users, Tag, Trash2, Edit2, Loader2, X, Shield, Truck, Search, BarChart2,
  Store, ShieldCheck, ShieldAlert, ExternalLink, FileText, Landmark,
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
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',         label: 'Users',          icon: Users    },
  { id: 'vendors',       label: 'Vendors',         icon: Store    },
  { id: 'categories',    label: 'Categories',     icon: Tag      },
  { id: 'deliveryfees',  label: 'Delivery Fees',  icon: Truck    },
  { id: 'analytics',     label: 'Analytics',      icon: BarChart2 },
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
        {activeTab === 'analytics'    && <AdminAnalyticsPanel />}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
