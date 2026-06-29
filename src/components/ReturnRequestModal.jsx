// src/components/ReturnRequestModal.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Check, Loader2, Trash2, AlertCircle, RotateCcw } from 'lucide-react';
import { returns as returnsApi, customerBankAccount as bankApi, vendor as vendorApi } from '../api/api';
import { confirmToast } from '../utils/confirmToast';

const RESOLVE_BANK_CODE_OVERRIDE = import.meta.env.VITE_BANK_TEST_CODE ?? null;

const RETURN_REASONS = [
  { value: 0, label: 'Defective Item' },
  { value: 1, label: 'Wrong Item Received' },
  { value: 2, label: 'Item Not as Described' },
  { value: 3, label: 'Damaged in Shipping' },
  { value: 4, label: 'Changed Mind' },
];

const EMPTY_BANK_FORM = { bankCode: '', accountNumber: '', isPrimary: false };

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700';

// ── Bank account mini-panel ───────────────────────────────────────────────────
function BankSection({ accounts, setAccounts }) {
  const [banks, setBanks]               = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState(EMPTY_BANK_FORM);
  const [resolvedName, setResolvedName] = useState('');
  const [resolving, setResolving]       = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [saving, setSaving]             = useState(false);
  const [settingId, setSettingId]       = useState(null);
  const [deletingId, setDeletingId]     = useState(null);

  // Load bank list when form opens
  useEffect(() => {
    if (!showForm || banks.length) return;
    setBanksLoading(true);
    vendorApi.getBanks()
      .then(data => setBanks(data ?? []))
      .catch(() => toast.error('Failed to load banks.'))
      .finally(() => setBanksLoading(false));
  }, [showForm]);

  // Auto-resolve account name
  useEffect(() => {
    setResolvedName('');
    setResolveError('');
    if (form.accountNumber.length !== 10 || !form.bankCode) return;
    const code = RESOLVE_BANK_CODE_OVERRIDE ?? form.bankCode;
    let cancelled = false;
    setResolving(true);
    vendorApi.resolveAccount(form.accountNumber, code)
      .then(d  => { if (!cancelled) setResolvedName(d.accountName ?? ''); })
      .catch(e  => { if (!cancelled) setResolveError(e.message ?? 'Could not resolve account.'); })
      .finally(() => { if (!cancelled) setResolving(false); });
    return () => { cancelled = true; };
  }, [form.accountNumber, form.bankCode]);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!resolvedName) return;
    const bank = banks.find(b => b.code === form.bankCode);
    setSaving(true);
    try {
      const created = await bankApi.add({
        accountNumber: form.accountNumber,
        bankCode:      RESOLVE_BANK_CODE_OVERRIDE ?? form.bankCode,
        bankName:      bank?.name ?? '',
        isPrimary:     form.isPrimary,
      });
      setAccounts(prev => {
        const updated = form.isPrimary
          ? prev.map(a => ({ ...a, isPrimary: false }))
          : prev;
        return [...updated, created];
      });
      toast.success('Bank account added.');
      setForm(EMPTY_BANK_FORM);
      setResolvedName('');
      setShowForm(false);
    } catch (err) {
      toast.error(err.message ?? 'Failed to add bank account.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPrimary = async (acc) => {
    setSettingId(acc.id);
    try {
      await bankApi.setPrimary(acc.id);
      setAccounts(prev => prev.map(a => ({ ...a, isPrimary: a.id === acc.id })));
      toast.success(`${acc.bankName} set as primary.`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to set primary.');
    } finally {
      setSettingId(null);
    }
  };

  const handleDelete = (acc) => {
    confirmToast(`Remove ${acc.bankName} (${acc.accountNumber})?`, async () => {
      setDeletingId(acc.id);
      try {
        await bankApi.delete(acc.id);
        setAccounts(prev => prev.filter(a => a.id !== acc.id));
        toast.success('Bank account removed.');
      } catch (err) {
        toast.error(err.message ?? 'Failed to remove bank account.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-green-900">Refund Account</p>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition">
            <Plus size={12} /> Add Account
          </button>
        )}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
          <AlertCircle size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            You must add a bank account to receive your refund if the return is approved.
          </p>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden mb-3">
          {accounts.map(acc => (
            <div key={acc.id} className={`flex items-center justify-between px-4 py-3 ${acc.isPrimary ? 'bg-orange-50' : 'bg-white'}`}>
              <div>
                <p className="text-sm font-medium text-green-900">{acc.bankName}</p>
                <p className="text-xs text-gray-500">{acc.accountNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {acc.isPrimary ? (
                  <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">Primary</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(acc)}
                    disabled={!!settingId || !!deletingId}
                    className="text-xs px-2.5 py-1 border border-gray-300 rounded-full text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 transition flex items-center gap-1">
                    {settingId === acc.id && <Loader2 size={11} className="animate-spin" />}
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(acc)}
                  disabled={!!deletingId || !!settingId}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition disabled:opacity-40">
                  {deletingId === acc.id
                    ? <Loader2 size={13} className="animate-spin text-red-400" />
                    : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Bank Account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bank *</label>
              {banksLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={13} className="animate-spin text-orange-400" />
                  <span className="text-xs text-gray-400">Loading banks…</span>
                </div>
              ) : (
                <select name="bankCode" value={form.bankCode} onChange={handle} required className={inputCls + ' bg-white'}>
                  <option value="">Select a bank</option>
                  {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Account Number *</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handle}
                required maxLength={10} placeholder="10-digit account number" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Account Name</label>
            <div className={`${inputCls} bg-white flex items-center gap-2 min-h-[38px]`}>
              {resolving ? (
                <><Loader2 size={13} className="animate-spin text-orange-400" /><span className="text-xs text-gray-400">Resolving…</span></>
              ) : resolveError ? (
                <span className="text-xs text-red-500">{resolveError}</span>
              ) : resolvedName ? (
                <span className="text-green-900 font-medium">{resolvedName}</span>
              ) : (
                <span className="text-gray-400 text-xs">Auto-fills when you enter account number</span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-green-900 cursor-pointer w-fit">
            <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handle} className="rounded" />
            Set as primary account
          </label>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleAdd} disabled={saving || !resolvedName}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? 'Saving…' : 'Add Account'}
            </button>
            <button type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_BANK_FORM); setResolvedName(''); setResolveError(''); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ReturnRequestModal({ orderDetail, onClose, onSuccess }) {
  const [accounts, setAccounts]         = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [reason, setReason]             = useState('');
  const [notes, setNotes]               = useState('');
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    bankApi.getAll()
      .then(data => setAccounts(Array.isArray(data) ? data : (data?.items ?? [])))
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, []);

  const hasPrimary = accounts.some(a => a.isPrimary);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPrimary) {
      toast.error('Please add and set a primary bank account first.');
      return;
    }
    if (reason === '') {
      toast.error('Please select a reason.');
      return;
    }
    setSubmitting(true);
    try {
      await returnsApi.create({
        orderDetailId:   orderDetail.id,
        reason:          Number(reason),
        additionalNotes: notes,
      });
      toast.success('Return request submitted successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message ?? 'Failed to submit return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <RotateCcw size={17} className="text-orange-400" />
            <h2 className="font-semibold text-green-900 text-sm">Return Item</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 transition rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* 7-day policy note */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              Return requests are only eligible within <span className="font-semibold">7 days</span> of delivery. Requests submitted after this window will not be accepted.
            </p>
          </div>

          {/* Item summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-gray-500 mb-0.5">Returning</p>
            <p className="text-sm font-semibold text-green-900">{orderDetail.productName}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Qty: {orderDetail.quantity} · ₦{Number(orderDetail.totalPrice).toLocaleString()}
            </p>
          </div>

          {/* Bank account section */}
          {accountsLoading ? (
            <div className="flex items-center gap-2 mb-5">
              <Loader2 size={15} className="animate-spin text-orange-400" />
              <span className="text-xs text-gray-400">Loading bank accounts…</span>
            </div>
          ) : (
            <BankSection accounts={accounts} setAccounts={setAccounts} />
          )}

          {/* Return details */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-green-900">Return Details</p>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Reason *</label>
              <select value={reason} onChange={e => setReason(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
                <option value="">Select a reason</option>
                {RETURN_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Additional Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe the issue in more detail (optional)…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button type="submit"
              disabled={submitting || !hasPrimary || reason === ''}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-900 text-orange-100 rounded-xl text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit Return Request'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-green-900 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
