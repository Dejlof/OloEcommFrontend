// src/pages/Account.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { addresses as addressesApi, auth as authApi } from '../api/api';
import { STATES, getCities } from '../utils/nigerianLocations';
import {
  User, ShoppingBag, Heart, MapPin, Lock,
  LogOut, Plus, Trash2, Edit2, Loader2
} from 'lucide-react';

// ── Address form ──────────────────────────────────────────────────────────────
const EMPTY_ADDR = { street: '', state: '', city: '', zipCode: '', country: 'Nigeria' };

function AddressTab() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY_ADDR);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  const cities = getCities(form.state);

  useEffect(() => {
    addressesApi.getMine({ pageNumber: 1, pageSize: 50 })
      .then(d => setList(d?.items ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      ...(name === 'state' ? { city: '' } : {}),
    }));
  };

  const openNew = () => { setForm(EMPTY_ADDR); setEditId(null); setShowForm(true); };
  const openEdit = (addr) => {
    setForm({ street: addr.street, state: addr.state, city: addr.city, zipCode: addr.zipCode, country: addr.country });
    setEditId(addr.id); setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const updated = await addressesApi.update(editId, form);
        setList(prev => prev.map(a => a.id === editId ? updated : a));
      } else {
        const created = await addressesApi.create(form);
        setList(prev => [...prev, created]);
      }
      toast.success(editId ? 'Address updated.' : 'Address added.');
      setShowForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressesApi.delete(id);
      setList(prev => prev.filter(a => a.id !== id));
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-400" size={28} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-green-900">My Addresses</h2>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 transition">
          <Plus size={14} /> Add Address
        </button>
      </div>

      {list.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-8">No addresses saved yet.</p>
      )}

      <div className="space-y-3 mb-5">
        {list.map(addr => (
          <div key={addr.id}
            className="flex justify-between items-start bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="text-sm text-green-900">
              <p>{addr.street}</p>
              <p className="text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
              <p className="text-gray-500">{addr.country}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(addr)} className="text-gray-400 hover:text-green-700 transition"><Edit2 size={15} /></button>
              <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-green-900 text-sm mb-2">{editId ? 'Edit' : 'New'} Address</h3>

          {/* Street */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Street *</label>
            <input name="street" value={form.street} onChange={handle} required
              placeholder="House number, street name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
          </div>

          {/* State */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">State *</label>
            <select name="state" value={form.state} onChange={handle} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
              <option value="">— Select state —</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">City *</label>
            <select name="city" value={form.city} onChange={handle} required
              disabled={!form.state}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white disabled:opacity-50">
              <option value="">— Select city —</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Zip code */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Zip / Postal Code</label>
            <input name="zipCode" value={form.zipCode} onChange={handle}
              placeholder="e.g. 100001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
          </div>

          {/* Country (locked to Nigeria) */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Country</label>
            <input name="country" value={form.country} readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Change password tab ───────────────────────────────────────────────────────
function PasswordTab() {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.newPassword.length < 10) { toast.error('Password must be at least 10 characters.'); return; }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <h2 className="font-semibold text-green-900 mb-2">Change Password</h2>
      {[
        { name: 'currentPassword', label: 'Current Password' },
        { name: 'newPassword',     label: 'New Password' },
        { name: 'confirmPassword', label: 'Confirm New Password' },
      ].map(f => (
        <div key={f.name}>
          <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
          <input name={f.name} type="password" value={form[f.name]} onChange={handle}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
        </div>
      ))}
      <button type="submit" disabled={saving}
        className="w-full py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 disabled:opacity-50 transition">
        {saving ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}

// ── Main Account page ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview',     icon: User },
  { id: 'orders',   label: 'My Orders',    icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist',     icon: Heart },
  { id: 'addresses',label: 'Address Book', icon: MapPin },
  { id: 'password', label: 'Password',     icon: Lock },
];

const Account = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row gap-6 w-[85%] m-auto py-10">

        {/* Sidebar */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl py-4 shadow-sm">
            {/* User info */}
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold text-green-900 text-lg">
                  {(user?.firstName?.[0] ?? user?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-green-900 text-sm">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              {user?.phoneNumber && (
                <p className="text-xs text-gray-400">{user.phoneNumber}</p>
              )}
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            {/* Nav items */}
            <nav className="pt-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition
                    ${activeTab === id
                      ? 'bg-orange-50 text-orange-600 font-medium border-r-2 border-orange-400'
                      : 'text-green-900 hover:bg-gray-50'}`}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}

              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition mt-2 border-t border-gray-100">
                <LogOut size={16} /> Log Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content panel */}
        <main className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[60vh]">
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-xl font-bold text-green-900 mb-6">Account Overview</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'My Orders',    desc: 'Track and manage your orders',  tab: 'orders',    icon: ShoppingBag },
                  { label: 'Address Book', desc: 'Manage delivery addresses',      tab: 'addresses', icon: MapPin },
                  { label: 'Wishlist',     desc: 'Items you\'ve saved',           tab: 'wishlist',  icon: Heart },
                  { label: 'Password',     desc: 'Update your password',           tab: 'password',  icon: Lock },
                ].map(item => (
                  <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                    className="text-left p-5 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition group">
                    <item.icon size={20} className="text-orange-400 mb-2 group-hover:text-orange-500" />
                    <p className="font-semibold text-green-900 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h1 className="text-xl font-bold text-green-900 mb-6">My Orders</h1>
              {/* Embed orders inline — navigate to /orders for full page */}
              <button onClick={() => navigate('/orders')}
                className="text-orange-500 underline text-sm">
                View full orders page →
              </button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h1 className="text-xl font-bold text-green-900 mb-6">Wishlist</h1>
              <button onClick={() => navigate('/wishlist')}
                className="text-orange-500 underline text-sm">
                View full wishlist →
              </button>
            </div>
          )}

          {activeTab === 'addresses' && <AddressTab />}
          {activeTab === 'password'  && <PasswordTab />}
        </main>
      </div>
    </MainLayout>
  );
};

export default Account;
