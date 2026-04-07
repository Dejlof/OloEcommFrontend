// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { auth as authApi } from '../api/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.token || !form.newPassword) {
      toast.error('All fields are required.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match.'); return;
    }
    if (form.newPassword.length < 10) {
      toast.error('Password must be at least 10 characters.'); return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email:       form.email,
        token:       form.token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      toast.success('Password reset successfully! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msgs = err.errors?.length ? err.errors : [err.message];
      toast.error(msgs.join(' '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[70vh] text-sm pt-16 pb-16">
        <Header title="Set New Password" word="Must be at least 10 characters with upper, lower, digit & special character." />

        <form onSubmit={handleSubmit} className="pt-4 w-full max-w-sm">
          <div>
            <Label label="Email" />
            <Input name="email" value={form.email} onChange={handle}
              placeholder="Your email address" type="email" />
          </div>

          <div className="pt-4">
            <Label label="Reset Token" />
            <Input name="token" value={form.token} onChange={handle}
              placeholder="Token sent to your email" type="text" />
          </div>

          <div className="pt-4">
            <Label label="New Password" />
            <div className="relative">
              <Input name="newPassword" value={form.newPassword} onChange={handle}
                placeholder="New password" type={showPassword ? 'text' : 'password'} />
              <button type="button" className="absolute right-4 top-3 text-gray-400"
                onClick={() => setShow(s => !s)}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <Label label="Confirm Password" />
            <div className="relative">
              <Input name="confirmPassword" value={form.confirmPassword} onChange={handle}
                placeholder="Confirm new password" type={showPassword ? 'text' : 'password'} />
            </div>
          </div>

          <div className="text-center pt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-green-900 font-light text-center">
          Didn't receive a token?{' '}
          <Link to="/forgotpassword" className="text-orange-400 font-bold underline">
            Resend
          </Link>
        </p>
        <p className="mt-2 text-green-900 font-light">
          <i className="fa-solid fa-arrow-left mr-1" />
          Back to <Link to="/login" className="text-orange-400">Log In</Link>
        </p>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
