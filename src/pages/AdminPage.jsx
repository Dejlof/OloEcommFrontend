// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { categories as categoriesApi, deliveryfee as deliveryFeeApi, auth } from '../api/api';
import { apiFetch } from '../api/api';
import { STATES, getCities } from '../utils/nigerianLocations';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import { confirmToast } from '../utils/confirmToast';
import {
  Users, Tag, Trash2,
  Edit2, Loader2, X, Shield, Truck, Search
} from 'lucide-react';

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

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'users',         label: 'Users',          icon: Users  },
  { id: 'categories',    label: 'Categories',     icon: Tag    },
  { id: 'deliveryfees',  label: 'Delivery Fees',  icon: Truck  },
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
        {activeTab === 'categories'   && <CategoriesPanel />}
        {activeTab === 'deliveryfees' && <DeliveryFeesPanel />}
      </div>
    </MainLayout>
  );
};

export default AdminPage;
