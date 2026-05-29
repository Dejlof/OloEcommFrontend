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
  firstName: '', lastName: '', email: '', phoneNumber: '',
  password: '', confirmPassword: '',
  businessName: '', businessEmail: '', businessPhone: '',
  businessAddress: '', businessDescription: '',
};

const VendorRegisterPage = () => {
  const { user, refreshAfterUpgrade } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({
    ...EMPTY,
    firstName:   user?.firstName   ?? '',
    lastName:    user?.lastName    ?? '',
    email:       user?.email       ?? '',
    phoneNumber: user?.phoneNumber ?? '',
  });
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      'firstName','lastName','email','phoneNumber','password','confirmPassword',
      'businessName','businessEmail','businessPhone','businessAddress','businessDescription',
    ];
    if (required.some(k => !form[k])) {
      toast.error('Please fill in all fields.'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.'); return;
    }
    if (form.password.length < 10) {
      toast.error('Password must be at least 10 characters.'); return;
    }

    setLoading(true);
    try {
      await vendorApi.register({
        firstName:           form.firstName,
        lastName:            form.lastName,
        email:               form.email,
        phoneNumber:         form.phoneNumber,
        password:            form.password,
        confirmPassword:     form.confirmPassword,
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

          {/* ── Personal details ───────────────────────────────── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-2">
            Personal Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label label="First Name" />
              <Input name="firstName" value={form.firstName} onChange={handle} placeholder="First name" type="text" />
            </div>
            <div>
              <Label label="Last Name" />
              <Input name="lastName" value={form.lastName} onChange={handle} placeholder="Last name" type="text" />
            </div>
            <div>
              <Label label="Email" />
              <Input name="email" value={form.email} onChange={handle} placeholder="Email address" type="email" />
            </div>
            <div>
              <Label label="Phone Number" />
              <Input name="phoneNumber" value={form.phoneNumber} onChange={handle} placeholder="Phone number" type="tel" />
            </div>
            <div className="relative">
              <Label label="Password" />
              <Input name="password" value={form.password} onChange={handle}
                placeholder="Password (min 10 chars)" type={showPassword ? 'text' : 'password'} />
              <button type="button" className="absolute right-4 bottom-2.5 text-gray-400"
                onClick={() => setShow(s => !s)}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            <div>
              <Label label="Confirm Password" />
              <Input name="confirmPassword" value={form.confirmPassword} onChange={handle}
                placeholder="Confirm password" type={showPassword ? 'text' : 'password'} />
            </div>
          </div>

          {/* ── Business details ───────────────────────────────── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 mt-8">
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
