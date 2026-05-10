// src/pages/LoginPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Input from '../components/Input';
import Label from '../components/Label';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname ?? '/';

  const [form, setForm]             = useState({ login: '', password: '' });
  const [showPassword, setShow]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const googleBtnRef                = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          await googleLogin(credential);
          navigate(from, { replace: true });
        } catch (err) {
          toast.error(err.message ?? 'Google sign-in failed.');
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: googleBtnRef.current?.offsetWidth,
    });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 429)
        toast.error('Account temporarily locked. Please try again later.');
      else
        toast.error(err.message ?? 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center w-[92%] sm:w-[75%] m-auto min-h-[60vh] text-sm pt-16 pb-16">
        <Header title="Log In" word="Welcome to Oloja! Please fill in your credentials" />

        <form onSubmit={handleSubmit} className="pt-4 w-full max-w-sm">
          <div>
            <Label label="Email, Username or Phone" />
            <Input name="login" value={form.login} onChange={handle}
              placeholder="Email, username or phone" type="text" />
          </div>

          <div className="pt-4">
            <Label label="Password" />
            <div className="relative">
              <Input name="password" value={form.password} onChange={handle}
                placeholder="Password" type={showPassword ? 'text' : 'password'} />
              <button type="button"
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShow(s => !s)}>
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div className="flex w-full pt-4 pb-5 justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <Input type="checkbox" wmd="w-4" w="w-4" pad="pl-0" />
              <span>Remember me</span>
            </label>
            <Link to="/forgotpassword" className="text-orange-500 underline text-xs">
              Forgot Password?
            </Link>
          </div>

          <div className="text-center">
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </Button>
          </div>

          {GOOGLE_CLIENT_ID && (
            <>
              <div className="flex items-center gap-3 py-4">
                <hr className="flex-1 border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <hr className="flex-1 border-gray-200" />
              </div>
              <div ref={googleBtnRef} className="w-full flex justify-center" />
            </>
          )}

          <p className="text-center pt-4 text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-medium underline">Sign up</Link>
          </p>
        </form>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
