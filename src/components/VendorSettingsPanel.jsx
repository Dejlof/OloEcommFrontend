// src/components/VendorSettingsPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { vendor as vendorApi } from '../api/api';
import { confirmToast } from '../utils/confirmToast';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Building2, Users, FileText, Landmark,
  Edit2, Check, X, ShieldCheck, ShieldAlert, Clock,
  Upload, ImageOff, RefreshCw, Trash2, ExternalLink,
  TrendingUp, CircleDollarSign, Info, History, AlertCircle,
} from 'lucide-react';

// ── Enum maps ─────────────────────────────────────────────────────────────────
// Mirrors backend VendorStatus: Pending=0 UnderReview=1 Verified=2 Suspended=3 Rejected=4
const VENDOR_STATUS = {
  0: { label: 'Pending Verification', colour: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock       },
  1: { label: 'Under Review',         colour: 'bg-blue-100 text-blue-700 border-blue-200',       icon: Clock       },
  2: { label: 'Verified',             colour: 'bg-green-100 text-green-700 border-green-200',    icon: ShieldCheck },
  3: { label: 'Suspended',            colour: 'bg-orange-100 text-orange-600 border-orange-200', icon: ShieldAlert },
  4: { label: 'Rejected',             colour: 'bg-red-100 text-red-600 border-red-200',          icon: ShieldAlert },
};

const MEMBER_ROLE = { 0: 'Owner', 1: 'Initiator', 2: 'Approver' };

const DOCUMENT_TYPE = { 0: 'NIN', 1: 'Passport', 2: 'CAC', 3: 'TIN', 4: 'Utility Bill', 5: 'Business License' };

// Mirrors backend SettlementStatus: Pending=1 Processing=2 Completed=3 Failed=4
const SETTLEMENT_STATUS = {
  1: { label: 'Pending',    colour: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Processing', colour: 'bg-blue-100 text-blue-700'     },
  3: { label: 'Completed',  colour: 'bg-green-100 text-green-700'   },
  4: { label: 'Failed',     colour: 'bg-red-100 text-red-600'       },
};

const DOC_STATUS = {
  0: { label: 'Pending',      colour: 'bg-yellow-100 text-yellow-700' },
  1: { label: 'Under Review', colour: 'bg-blue-100 text-blue-700'     },
  2: { label: 'Verified',     colour: 'bg-green-100 text-green-700'   },
  3: { label: 'Rejected',     colour: 'bg-red-100 text-red-600'       },
};

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon size={17} className="text-orange-400" />
        <h3 className="font-semibold text-green-900 text-sm">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Status banner ─────────────────────────────────────────────────────────────
function StatusBanner({ status, rejectionReason }) {
  const s = VENDOR_STATUS[status] ?? VENDOR_STATUS[0];
  const Icon = s.icon;
  return (
    <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border mb-6 ${s.colour}`}>
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{s.label}</p>
        {(status === 0 || status === 1) && (
          <p className="text-xs mt-0.5 opacity-80">
            Your vendor account is awaiting review by our team. You can still add products while verification is in progress.
          </p>
        )}
        {(status === 3 || status === 4) && rejectionReason && (
          <p className="text-xs mt-0.5 opacity-80">Reason: {rejectionReason}</p>
        )}
      </div>
    </div>
  );
}

// ── Logo upload ───────────────────────────────────────────────────────────────
function LogoUpload({ vendorId, logoUrl, onUploaded, isOwner }) {
  const fileRef              = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file,    setFile]    = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    e.target.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await vendorApi.uploadLogo(vendorId, formData);
      const refreshed = await vendorApi.getMine();
      onUploaded(refreshed.logoUrl);
      URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      toast.success('Logo updated.');
    } catch (err) {
      toast.error(err.message ?? 'Logo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const cancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  };

  const currentSrc = preview ?? logoUrl;

  return (
    <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
      {/* Logo display */}
      <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
        {currentSrc
          ? <img src={currentSrc} alt="Business logo" className="w-full h-full object-cover" />
          : <ImageOff size={24} className="text-gray-300" />}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-500 font-medium">Business Logo</p>

        {!preview ? (
          isOwner && (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-green-900 hover:bg-gray-50 transition w-fit">
              {logoUrl ? <RefreshCw size={13} /> : <Upload size={13} />}
              {logoUrl ? 'Change Logo' : 'Upload Logo'}
            </button>
          )
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900 text-orange-100 rounded-lg text-xs hover:bg-green-800 disabled:opacity-50 transition">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {uploading ? 'Uploading…' : 'Save Logo'}
            </button>
            <button
              onClick={cancel}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-green-900 hover:bg-gray-50 disabled:opacity-50 transition">
              <X size={13} /> Cancel
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400">JPG, PNG, WEBP — max 5 MB</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleSelect} />
      </div>
    </div>
  );
}

// ── Business profile form ─────────────────────────────────────────────────────
function BusinessProfile({ profile, onSaved, isOwner }) {
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [logoUrl,  setLogoUrl]  = useState(profile.logoUrl ?? null);
  const [form, setForm] = useState({
    businessName:        profile.businessName        ?? '',
    businessEmail:       profile.businessEmail       ?? '',
    businessPhone:       profile.businessPhone       ?? '',
    businessAddress:     profile.businessAddress     ?? '',
    businessDescription: profile.businessDescription ?? '',
  });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await vendorApi.update(form);
      onSaved(updated);
      setEditing(false);
      toast.success('Business profile updated.');
    } catch (err) {
      toast.error(err.message ?? 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { name: 'businessName',    label: 'Business Name',    type: 'text'  },
    { name: 'businessEmail',   label: 'Business Email',   type: 'email' },
    { name: 'businessPhone',   label: 'Business Phone',   type: 'tel'   },
    { name: 'businessAddress', label: 'Business Address', type: 'text'  },
  ];

  return (
    <Section icon={Building2} title="Business Profile">
      <LogoUpload
        vendorId={profile.id}
        logoUrl={logoUrl}
        onUploaded={url => setLogoUrl(url)}
        isOwner={isOwner}
      />
      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(f => (
              <div key={f.name}>
                <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={handle}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Business Description</label>
            <textarea name="businessDescription" value={form.businessDescription} onChange={handle} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              { label: 'Business Name',    value: profile.businessName    },
              { label: 'Business Email',   value: profile.businessEmail   },
              { label: 'Business Phone',   value: profile.businessPhone   },
              { label: 'Business Address', value: profile.businessAddress },
            ].map(row => (
              <div key={row.label}>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="text-green-900 font-medium mt-0.5">{row.value || '—'}</p>
              </div>
            ))}
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400">Description</p>
              <p className="text-green-900 mt-0.5">{profile.businessDescription || '—'}</p>
            </div>
          </div>
          {isOwner ? (
            <button onClick={() => setEditing(true)}
              className="mt-5 flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <Edit2 size={14} /> Edit
            </button>
          ) : (
            <p className="mt-5 text-xs text-gray-400 italic">Only the account owner can edit business details.</p>
          )}
        </div>
      )}
    </Section>
  );
}

// ── Team members ──────────────────────────────────────────────────────────────
const EMPTY_MEMBER = { userEmail: '', firstName: '', lastName: '', role: '1' };

function TeamMembers({ vendorId, members, canAddMember, onMemberAdded, onMemberRemoved, onMemberRoleUpdated }) {
  const [showForm,    setShowForm]    = useState(false);
  const [form,        setForm]        = useState(EMPTY_MEMBER);
  const [saving,      setSaving]      = useState(false);
  const [removingId,  setRemovingId]  = useState(null);
  const [editRoleId,  setEditRoleId]  = useState(null);
  const [updatingRole, setUpdatingRole] = useState(null);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRemove = (member) => {
    confirmToast(`Remove ${member.userFullName || member.userEmail} from the team?`, async () => {
      setRemovingId(member.id);
      try {
        await vendorApi.removeMember(vendorId, member.userId);
        onMemberRemoved(member.id);
        toast.success('Member removed.');
      } catch (err) {
        toast.error(err.message ?? 'Failed to remove member.');
      } finally {
        setRemovingId(null);
      }
    });
  };

  const handleRoleChange = async (member, newRole) => {
    if (parseInt(newRole, 10) === member.role) { setEditRoleId(null); return; }
    setUpdatingRole(member.id);
    try {
      await vendorApi.updateMemberRole(vendorId, member.userId, parseInt(newRole, 10));
      onMemberRoleUpdated(member.id, parseInt(newRole, 10));
      toast.success('Role updated.');
    } catch (err) {
      toast.error(err.message ?? 'Failed to update role.');
    } finally {
      setUpdatingRole(null);
      setEditRoleId(null);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.userEmail || !form.firstName || !form.lastName) {
      return;
    }
    setSaving(true);
    try {
      const newMember = await vendorApi.addMember(vendorId, {
        userEmail: form.userEmail,
        firstName: form.firstName,
        lastName:  form.lastName,
        role:      parseInt(form.role, 10),
      });
      onMemberAdded(newMember);
      setForm(EMPTY_MEMBER);
      setShowForm(false);
      toast.success(`${newMember.userFullName} added to team.`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700';

  return (
    <Section icon={Users} title="Team Members">
      {/* Member list */}
      {members.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 text-center py-4">No team members yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-green-900">{m.userFullName || m.userEmail}</p>
                <p className="text-xs text-gray-400">{m.userEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Role badge — clickable only for owner acting on non-owner members */}
                {canAddMember && m.role !== 0 && editRoleId === m.id ? (
                  <div className="flex items-center gap-1">
                    <select
                      defaultValue={m.role}
                      disabled={updatingRole === m.id}
                      onChange={e => handleRoleChange(m, e.target.value)}
                      onBlur={() => setEditRoleId(null)}
                      autoFocus
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 text-green-900 bg-white focus:outline-none focus:ring-1 focus:ring-green-700">
                      <option value="1">Initiator</option>
                      <option value="2">Approver</option>
                    </select>
                    {updatingRole === m.id && <Loader2 size={13} className="animate-spin text-orange-400" />}
                  </div>
                ) : canAddMember && m.role !== 0 ? (
                  <button
                    onClick={() => setEditRoleId(m.id)}
                    title="Change role"
                    className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition">
                    {MEMBER_ROLE[m.role] ?? `Role ${m.role}`}
                  </button>
                ) : (
                  <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">
                    {MEMBER_ROLE[m.role] ?? `Role ${m.role}`}
                  </span>
                )}

                <span className={`text-xs px-2.5 py-1 rounded-full ${
                  m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {m.isActive ? 'Active' : 'Inactive'}
                </span>

                {canAddMember && m.role !== 0 && (
                  <button
                    onClick={() => handleRemove(m)}
                    disabled={!!removingId}
                    title="Remove member"
                    className="p-1.5 text-gray-300 hover:text-red-500 transition disabled:opacity-40">
                    {removingId === m.id
                      ? <Loader2 size={14} className="animate-spin text-red-400" />
                      : <Trash2 size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add member form */}
      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">New Member</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handle} required
                placeholder="First name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handle} required
                placeholder="Last name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email *</label>
              <input name="userEmail" type="email" value={form.userEmail} onChange={handle} required
                placeholder="member@example.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role *</label>
              <select name="role" value={form.role} onChange={handle}
                className={inputCls + ' bg-white'}>
                <option value="1">Initiator</option>
                <option value="2">Approver</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Adding…' : 'Add Member'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_MEMBER); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      )}

      {canAddMember && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mt-4 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-green-700 hover:text-green-700 transition w-fit">
          + Add Member
        </button>
      )}
    </Section>
  );
}

// ── Documents ─────────────────────────────────────────────────────────────────
const EMPTY_DOC = { type: '0', documentNumber: '' };

function Documents({ vendorId, documents, onUploaded, isOwner }) {
  const fileRef                  = useRef(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_DOC);
  const [file,       setFile]       = useState(null);
  const [uploading,  setUploading]  = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.documentNumber.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('Type', parseInt(form.type, 10));
      fd.append('DocumentNumber', form.documentNumber.trim());
      if (file) fd.append('DocumentFile', file);
      const newDoc = await vendorApi.uploadDocument(vendorId, fd);
      onUploaded(newDoc);
      setForm(EMPTY_DOC);
      setFile(null);
      setShowForm(false);
      toast.success('Document uploaded successfully.');
    } catch (err) {
      toast.error(err.message ?? 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700';

  return (
    <Section icon={FileText} title="Verification Documents">
      {/* Document list */}
      {documents.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <FileText size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload NIN, International Passport, CAC or Driver's Licence to verify your account.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {documents.map(doc => {
            const st = DOC_STATUS[doc.status] ?? DOC_STATUS[0];
            return (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {DOCUMENT_TYPE[doc.type] ?? `Document ${doc.type}`}
                  </p>
                  <p className="text-xs text-gray-400">#{doc.documentNumber}</p>
                  {doc.rejectionReason && (
                    <p className="text-xs text-red-500 mt-0.5">{doc.rejectionReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${st.colour}`}>
                    {st.label}
                  </span>
                  {doc.documentUrl && (
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View document"
                      className="p-1.5 text-gray-400 hover:text-green-700 transition">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">New Document</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Type *</label>
              <select name="type" value={form.type} onChange={handle} className={inputCls + ' bg-white'}>
                {Object.entries(DOCUMENT_TYPE).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Number *</label>
              <input
                name="documentNumber"
                value={form.documentNumber}
                onChange={handle}
                required
                placeholder="e.g. A00000000"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Document File (optional)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs text-green-900 hover:bg-gray-50 transition">
                <Upload size={13} /> {file ? 'Change File' : 'Choose File'}
              </button>
              {file && (
                <span className="text-xs text-gray-500 truncate max-w-[200px]">{file.name}</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {uploading ? 'Uploading…' : 'Upload Document'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_DOC); setFile(null); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        isOwner ? (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-green-700 hover:text-green-700 transition w-fit">
            + Upload Document
          </button>
        ) : (
          <p className="mt-4 text-xs text-gray-400 italic">Only the account owner can upload documents.</p>
        )
      )}
    </Section>
  );
}

// ── Bank accounts ─────────────────────────────────────────────────────────────
// Set VITE_BANK_TEST_CODE=001 in .env to override the bank code used during
// account resolution (Paystack test mode accepts only bankCode 001).
const RESOLVE_BANK_CODE_OVERRIDE = import.meta.env.VITE_BANK_TEST_CODE ?? null;

const EMPTY_BANK_FORM = { bankCode: '', accountNumber: '', isPrimary: false };

function BankAccounts({ vendorId, accounts, onAccountAdded, onPrimaryChanged, onAccountDeleted, isOwner }) {
  const [banks,           setBanks]           = useState([]);
  const [banksLoading,    setBanksLoading]    = useState(false);
  const [showForm,        setShowForm]        = useState(false);
  const [form,            setForm]            = useState(EMPTY_BANK_FORM);
  const [resolvedName,    setResolvedName]    = useState('');
  const [resolving,       setResolving]       = useState(false);
  const [resolveError,    setResolveError]    = useState('');
  const [saving,          setSaving]          = useState(false);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);
  const [deletingId,      setDeletingId]      = useState(null);

  const handleSetPrimary = async (acc) => {
    setSettingPrimaryId(acc.id);
    try {
      await vendorApi.setPrimaryAccount(vendorId, acc.id);
      onPrimaryChanged(acc.id);
      toast.success(`${acc.bankName} set as primary account.`);
    } catch (err) {
      toast.error(err.message ?? 'Failed to set primary account.');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = (acc) => {
    confirmToast(`Remove ${acc.bankName} (${acc.accountNumber})?`, async () => {
      setDeletingId(acc.id);
      try {
        await vendorApi.deleteBankAccount(vendorId, acc.id);
        onAccountDeleted(acc.id);
        toast.success('Bank account removed.');
      } catch (err) {
        toast.error(err.message ?? 'Failed to remove bank account.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  // Load banks when form is opened
  useEffect(() => {
    if (!showForm || banks.length) return;
    setBanksLoading(true);
    vendorApi.getBanks()
      .then(data => setBanks(data ?? []))
      .catch(() => toast.error('Failed to load banks.'))
      .finally(() => setBanksLoading(false));
  }, [showForm]);

  // Auto-resolve account name when number is 10 digits and bank is selected
  useEffect(() => {
    setResolvedName('');
    setResolveError('');
    if (form.accountNumber.length !== 10 || !form.bankCode) return;

    const resolveCode = RESOLVE_BANK_CODE_OVERRIDE ?? form.bankCode;
    let cancelled = false;
    setResolving(true);
    vendorApi.resolveAccount(form.accountNumber, resolveCode)
      .then(data => { if (!cancelled) setResolvedName(data.accountName ?? ''); })
      .catch(err  => { if (!cancelled) setResolveError(err.message ?? 'Could not resolve account.'); })
      .finally(() => { if (!cancelled) setResolving(false); });
    return () => { cancelled = true; };
  }, [form.accountNumber, form.bankCode]);

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedName) return;
    const bank = banks.find(b => b.code === form.bankCode);
    setSaving(true);
    try {
      const newAccount = await vendorApi.addBankAccount(vendorId, {
        accountName:   resolvedName,
        accountNumber: form.accountNumber,
        bankCode:      RESOLVE_BANK_CODE_OVERRIDE ?? form.bankCode,
        bankName:      bank?.name ?? '',
        isPrimary:     form.isPrimary,
      });
      onAccountAdded(newAccount);
      setForm(EMPTY_BANK_FORM);
      setResolvedName('');
      setShowForm(false);
      toast.success('Bank account added.');
    } catch (err) {
      toast.error(err.message ?? 'Failed to add bank account.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-green-900 focus:outline-none focus:ring-2 focus:ring-green-700';

  return (
    <Section icon={Landmark} title="Bank Accounts">
      {/* Account list */}
      {accounts.length === 0 && !showForm ? (
        <div className="text-center py-6">
          <Landmark size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No bank accounts added yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Add a bank account to receive settlement payments.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {accounts.map(acc => (
            <div key={acc.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-green-900">{acc.bankName}</p>
                <p className="text-xs text-gray-500">{acc.accountName} — {acc.accountNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                {acc.isPrimary ? (
                  <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full">Primary</span>
                ) : isOwner ? (
                  <button
                    onClick={() => handleSetPrimary(acc)}
                    disabled={!!settingPrimaryId || !!deletingId}
                    className="text-xs px-2.5 py-1 border border-gray-300 rounded-full text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-40 transition flex items-center gap-1">
                    {settingPrimaryId === acc.id
                      ? <Loader2 size={11} className="animate-spin" />
                      : null}
                    Set Primary
                  </button>
                ) : null}
                <button
                  onClick={() => handleDelete(acc)}
                  disabled={!!deletingId || !!settingPrimaryId}
                  title="Remove account"
                  className="p-1.5 text-gray-300 hover:text-red-500 transition disabled:opacity-40">
                  {deletingId === acc.id
                    ? <Loader2 size={14} className="animate-spin text-red-400" />
                    : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add bank account form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">New Bank Account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bank *</label>
              {banksLoading ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={14} className="animate-spin text-orange-400" />
                  <span className="text-xs text-gray-400">Loading banks…</span>
                </div>
              ) : (
                <select name="bankCode" value={form.bankCode} onChange={handle} required className={inputCls + ' bg-white'}>
                  <option value="">Select a bank</option>
                  {banks.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Account Number *</label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handle}
                required
                maxLength={10}
                placeholder="10-digit account number"
                className={inputCls}
              />
            </div>
          </div>

          {/* Resolved account name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Account Name</label>
            <div className={`${inputCls} bg-gray-50 flex items-center gap-2 min-h-[38px]`}>
              {resolving ? (
                <><Loader2 size={13} className="animate-spin text-orange-400" /><span className="text-xs text-gray-400">Resolving…</span></>
              ) : resolveError ? (
                <span className="text-xs text-red-500">{resolveError}</span>
              ) : resolvedName ? (
                <span className="text-green-900 font-medium">{resolvedName}</span>
              ) : (
                <span className="text-gray-400 text-xs">Will auto-fill after entering account number</span>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-green-900 cursor-pointer w-fit">
            <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handle} className="rounded" />
            Set as primary account
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || !resolvedName}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-900 text-orange-100 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50 transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? 'Saving…' : 'Add Account'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_BANK_FORM); setResolvedName(''); setResolveError(''); }}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg text-sm text-green-900 hover:bg-gray-50 transition">
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        isOwner ? (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-green-700 hover:text-green-700 transition w-fit">
            + Add Bank Account
          </button>
        ) : (
          <p className="mt-4 text-xs text-gray-400 italic">Only the account owner can add bank accounts.</p>
        )
      )}
    </Section>
  );
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function fmt(amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
}

function EarningsSummaryCard({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-base font-semibold ${highlight ? 'text-green-800' : 'text-green-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Earnings({ vendorId }) {
  const [earnings, setEarnings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    vendorApi.getEarnings(vendorId)
      .then(data => setEarnings(data ?? []))
      .catch(err => setError(err.message ?? 'Failed to load earnings.'))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const reload = () => {
    setLoading(true);
    setError('');
    vendorApi.getEarnings(vendorId)
      .then(data => setEarnings(data ?? []))
      .catch(err => setError(err.message ?? 'Failed to load earnings.'))
      .finally(() => setLoading(false));
  };

  const totalGross = earnings?.reduce((s, e) => s + e.grossAmount, 0) ?? 0;
  const totalNet   = earnings?.reduce((s, e) => s + e.netAmount,   0) ?? 0;

  return (
    <Section icon={TrendingUp} title="Unsettled Earnings">
      {/* T+7 notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-lg mb-5 text-xs text-orange-700">
        <Info size={13} className="mt-0.5 flex-shrink-0" />
        <span>Earnings become eligible for settlement <strong>7 days (T+7)</strong> after the delivery date.</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-orange-400" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          <span>{error}</span>
          <button onClick={reload} className="ml-3 flex items-center gap-1 text-xs underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : earnings.length === 0 ? (
        <div className="text-center py-8">
          <CircleDollarSign size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No unsettled earnings.</p>
          <p className="text-xs text-gray-400 mt-1">Earnings awaiting settlement will appear here.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <EarningsSummaryCard label="Total Sales"   value={fmt(totalGross)} />
            <EarningsSummaryCard label="Pending Payout" value={fmt(totalNet)} highlight />
          </div>

          {/* Earnings list */}
          <div className="divide-y divide-gray-100">
            {earnings.map(e => {
              const date = new Date(e.earnedAt);
              const eligible = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000) <= new Date();
              return (
                <div key={e.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{e.productName}</p>
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-semibold text-green-900">{fmt(e.netAmount)}</p>
                    {eligible ? (
                      <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">Eligible</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full whitespace-nowrap">Pending T+7</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Section>
  );
}

// ── Settlement History ────────────────────────────────────────────────────────
function SettlementHistory({ vendorId }) {
  const [records,  setRecords]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    vendorApi.getSettlements(vendorId)
      .then(data => setRecords(data ?? []))
      .catch(err => setError(err.message ?? 'Failed to load settlement history.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [vendorId]);

  return (
    <Section icon={History} title="Settlement History">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-orange-400" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          <span>{error}</span>
          <button onClick={load} className="ml-3 flex items-center gap-1 text-xs underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <History size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No settlements yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {records.map(r => {
            const st = SETTLEMENT_STATUS[r.status] ?? { label: 'Unknown', colour: 'bg-gray-100 text-gray-500' };
            const initiated = r.initiatedAt ? new Date(r.initiatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
            const completed = r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
            return (
              <div key={r.id} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-green-900">{fmt(r.amount)}</p>
                    <p className="text-xs text-gray-400">{initiated}{completed ? ` → ${completed}` : ''}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.colour}`}>{st.label}</span>
                </div>
                {r.failureReason && (
                  <p className="text-xs text-red-500 flex items-start gap-1">
                    <Info size={11} className="mt-0.5 flex-shrink-0" />
                    {r.failureReason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

// ── Vendor Debts ──────────────────────────────────────────────────────────────
function VendorDebts({ vendorId }) {
  const [debts,    setDebts]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('outstanding'); // 'outstanding' | 'recovered' | 'all'

  const load = (f) => {
    setLoading(true);
    setError('');
    const recovered = f === 'recovered' ? true : f === 'outstanding' ? false : undefined;
    vendorApi.getDebts(vendorId, recovered)
      .then(data => setDebts(data ?? []))
      .catch(err => setError(err.message ?? 'Failed to load debts.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [vendorId]);

  const handleFilter = (f) => { setFilter(f); load(f); };

  const totalDebt = debts?.reduce((s, d) => s + d.amount, 0) ?? 0;

  return (
    <Section icon={AlertCircle} title="Debts">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'outstanding', label: 'Outstanding' },
          { key: 'recovered',   label: 'Recovered'   },
          { key: 'all',         label: 'All'          },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
              filter === key
                ? 'bg-green-900 text-orange-100 border-green-900'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-orange-400" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          <span>{error}</span>
          <button onClick={() => load(filter)} className="ml-3 flex items-center gap-1 text-xs underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter} debts.</p>
        </div>
      ) : (
        <>
          {filter !== 'recovered' && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
              <span className="text-xs text-red-600 font-medium">Total outstanding</span>
              <span className="text-sm font-bold text-red-700">{fmt(totalDebt)}</span>
            </div>
          )}
          <div className="divide-y divide-gray-100">
            {debts.map(d => (
              <div key={d.id} className="py-3 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-900 truncate">{d.productName ?? `Order #${d.orderDetailId}`}</p>
                    <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-red-700">{fmt(d.amount)}</span>
                    {d.isRecovered ? (
                      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full">Recovered</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 bg-red-100 text-red-600 rounded-full">Outstanding</span>
                    )}
                  </div>
                </div>
                {d.reason && <p className="text-xs text-gray-500">{d.reason}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function VendorSettingsPanel() {
  const { user }  = useAuth();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    vendorApi.getMine()
      .then(data => { setProfile(data); setMembers(data.members ?? []); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-orange-400" size={32} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
        {error || 'Failed to load vendor profile.'}
      </div>
    );
  }

  const isOwner = members.some(m => m.userId === user?.id && m.role === 0);

  return (
    <div>
      <StatusBanner status={profile.status} rejectionReason={profile.rejectionReason} />
      <BusinessProfile profile={profile} onSaved={updated => setProfile(p => ({ ...p, ...updated }))} isOwner={isOwner} />
      <TeamMembers
        vendorId={profile.id}
        members={members}
        canAddMember={members.some(m => m.userId === user?.id && (m.role === 0 || m.role === 2))}
        onMemberAdded={m => setMembers(prev => [...prev, m])}
        onMemberRemoved={id => setMembers(prev => prev.filter(m => m.id !== id))}
        onMemberRoleUpdated={(id, role) => setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))}
      />
      <Documents
        vendorId={profile.id}
        documents={profile.documents ?? []}
        onUploaded={doc => setProfile(p => ({ ...p, documents: [...(p.documents ?? []), doc] }))}
        isOwner={isOwner}
      />
      <BankAccounts
        vendorId={profile.id}
        accounts={profile.bankAccounts ?? []}
        onAccountAdded={acc => setProfile(p => ({ ...p, bankAccounts: [...(p.bankAccounts ?? []), acc] }))}
        onPrimaryChanged={id => setProfile(p => ({
          ...p,
          bankAccounts: (p.bankAccounts ?? []).map(a => ({ ...a, isPrimary: a.id === id })),
        }))}
        onAccountDeleted={id => setProfile(p => ({
          ...p,
          bankAccounts: (p.bankAccounts ?? []).filter(a => a.id !== id),
        }))}
        isOwner={isOwner}
      />
      <Earnings vendorId={profile.id} />
      <VendorDebts vendorId={profile.id} />
      <SettlementHistory vendorId={profile.id} />
    </div>
  );
}
