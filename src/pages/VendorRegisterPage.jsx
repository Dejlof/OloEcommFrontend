// src/pages/VendorRegisterPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { vendor as vendorApi } from '../api/api';

const EMPTY = {
  businessName: '', businessEmail: '', businessPhone: '',
  businessAddress: '', businessDescription: '',
};

const VendorRegisterPage = () => {
  const { refreshAfterUpgrade } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      'businessName','businessEmail','businessPhone','businessAddress','businessDescription',
    ];
    if (required.some(k => !form[k])) {
      toast.error('Please fill in all fields.'); return;
    }

    setLoading(true);
    try {
      await vendorApi.register({
        businessName:        form.businessName,
        businessEmail:       form.businessEmail,
        businessPhone:       form.businessPhone,
        businessAddress:     form.businessAddress,
        businessDescription: form.businessDescription,
      });
      await refreshAfterUpgrade();
      toast.success('Vendor account created! Redirecting to dashboard…');
      setTimeout(() => navigate('/vendor'), 1500);
    } catch (err) {
      toast.error(err.message ?? 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[80vh] text-sm pt-16 pb-16">
        <Header
          title="Become a Vendor"
          word="Register your business on Oloja and start selling today"
        />

        <form onSubmit={handleSubmit} className="pt-4 w-full max-w-lg">

          {/* ── Business details ───────────────────────────────── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-2">
            Business Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label label="Business Name" />
              <Input name="businessName" value={form.businessName} onChange={handle} placeholder="Business name" type="text" />
            </div>
            <div>
              <Label label="Business Email" />
              <Input name="businessEmail" value={form.businessEmail} onChange={handle} placeholder="Business email" type="email" />
            </div>
            <div>
              <Label label="Business Phone" />
              <Input name="businessPhone" value={form.businessPhone} onChange={handle} placeholder="Business phone" type="tel" />
            </div>
            <div>
              <Label label="Business Address" />
              <Input name="businessAddress" value={form.businessAddress} onChange={handle} placeholder="Business address" type="text" />
            </div>
          </div>

          <div className="mt-4">
            <Label label="Business Description" />
            <textarea
              name="businessDescription"
              value={form.businessDescription}
              onChange={handle}
              rows={3}
              placeholder="Briefly describe what your business sells…"
              className="border py-2 pl-3 pr-3 w-full text-green-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
          </div>

          <div className="text-center pt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register as Vendor'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default VendorRegisterPage;
