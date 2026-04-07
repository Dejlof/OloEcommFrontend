// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Header from '../components/Header';
import Label from '../components/Label';
import Input from '../components/Input';
import Button from '../components/Button';
import { auth as authApi } from '../api/api';

export const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email.'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      // Always show success — backend never reveals whether email exists
      setSent(true);
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[60vh] text-sm pt-16 pb-16">
        <Header title="Forgot Password" word="No worries, we'll send you reset instructions." />

        {sent ? (
          <div className="mt-8 text-center max-w-sm">
            <div className="px-6 py-5 bg-green-50 border border-green-200 text-green-800 rounded-xl">
              <p className="font-medium">Check your email</p>
              <p className="mt-1 text-xs text-green-600">
                If <strong>{email}</strong> is registered you'll receive a reset token shortly.
              </p>
            </div>
            <Link to="/resetpassword"
              className="mt-4 inline-block text-orange-500 underline text-sm">
              I have my token → Reset password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm">
              <Label label="Email" />
            <Input type="email" placeholder="Enter your email" name="email"
              value={email} onChange={e => setEmail(e.target.value)} required />

            <div className="mt-6 text-center">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Token'}
              </Button>
            </div>

            <p className="mt-5 text-center text-green-900">
              <i className="fa-solid fa-arrow-left mr-1" />
              Back to <Link to="/login" className="text-orange-500 underline">Log In</Link>
            </p>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
