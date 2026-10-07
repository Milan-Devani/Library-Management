import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FiBookOpen, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful! Welcome back.');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.payload || 'Invalid email or password');
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@library.com');
    setPassword('admin123');
    toast('Demo credentials auto-filled', { icon: '🔑' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
          <FiBookOpen className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Library Management System
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to access librarian and administration portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@library.com"
              icon={FiMail}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={FiLock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Card */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-900">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold uppercase tracking-wider text-[10px] text-blue-700">College Demo Login:</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline"
                >
                  Quick Fill
                </button>
              </div>
              <p><span className="font-medium text-slate-600">Email:</span> admin@library.com</p>
              <p><span className="font-medium text-slate-600">Password:</span> admin123</p>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500">
              Need a new librarian account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
