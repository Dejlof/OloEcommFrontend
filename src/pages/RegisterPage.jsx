// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(form).some(v => !v)) {
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
      await register({
        firstName:       form.firstName,
        lastName:        form.lastName,
        email:           form.email,
        phoneNumber:     form.phoneNumber,
        password:        form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msgs = err.errors?.length ? err.errors : [err.message];
      toast.error(msgs.join(' '));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[80vh] text-sm pt-16 pb-16">
        <Header title="Sign Up" word="Welcome to Oloja! Please fill in your details" />

        <form onSubmit={handleSubmit} className="pt-4 w-full max-w-sm">
          <div><Label label="First Name" />
            <Input name="firstName" value={form.firstName} onChange={handle} placeholder="First name" type="text" /></div>

          <div className="pt-4"><Label label="Last Name" />
            <Input name="lastName" value={form.lastName} onChange={handle} placeholder="Last name" type="text" /></div>

          <div className="pt-4"><Label label="Email" />
            <Input name="email" value={form.email} onChange={handle} placeholder="Your email" type="email" /></div>

          <div className="pt-4"><Label label="Phone Number" />
            <Input name="phoneNumber" value={form.phoneNumber} onChange={handle} placeholder="Your phone number" type="tel" /></div>

          <div className="pt-4"><Label label="Password" />
            <div className="relative">
              <Input name="password" value={form.password} onChange={handle}
                placeholder="Password (min 10 chars)" type={showPassword ? 'text' : 'password'} />
              <button type="button" className="absolute right-4 top-3 text-gray-400"
                onClick={() => setShow(s => !s)}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div className="pt-4"><Label label="Confirm Password" />
            <div className="relative">
              <Input name="confirmPassword" value={form.confirmPassword} onChange={handle}
                placeholder="Confirm password" type={showPassword ? 'text' : 'password'} />
            </div>
          </div>

          <div className="text-center pt-8">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </div>

          <p className="text-center pt-4 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-medium underline">Log in</Link>
          </p>
        </form>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
