// src/pages/ForceChangePasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { auth as authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

const ForceChangePasswordPage = () => {
  const { clearMustChangePassword } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
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
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success('Password changed successfully!');
      clearMustChangePassword();
      navigate('/', { replace: true });
    } catch (err) {
      const msgs = err.errors?.length ? err.errors : [err.message ?? 'Failed to change password.'];
      toast.error(msgs.join(' '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[70vh] text-sm pt-16 pb-16">
        <Header
          title="Change Your Password"
          word="Your account requires a password change before you can continue."
        />

        <div className="w-full max-w-sm mt-2 mb-6 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700 text-center">
          You must update your password to access your account.
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <Label label="Current Password" />
            <div className="relative">
              <Input name="currentPassword" value={form.currentPassword} onChange={handle}
                placeholder="Current password" type={showPassword ? 'text' : 'password'} />
              <button type="button" className="absolute right-4 top-3 text-gray-400"
                onClick={() => setShow(s => !s)}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div>
            <Label label="New Password" />
            <Input name="newPassword" value={form.newPassword} onChange={handle}
              placeholder="New password (min 10 chars)" type={showPassword ? 'text' : 'password'} />
          </div>

          <div>
            <Label label="Confirm New Password" />
            <Input name="confirmPassword" value={form.confirmPassword} onChange={handle}
              placeholder="Confirm new password" type={showPassword ? 'text' : 'password'} />
          </div>

          <div className="text-center pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Changing…' : 'Change Password'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default ForceChangePasswordPage;
