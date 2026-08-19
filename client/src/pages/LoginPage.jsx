import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpenCheck, ShieldCheck, BookMarked, UserCheck, KeyRound, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'librarian') navigate('/librarian');
      else navigate('/member');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response || err.response.status >= 500) {
        setError('Cannot connect to backend server. Please ensure the backend server is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Auto-fill Helper
  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPassword);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'librarian') navigate('/librarian');
      else navigate('/member');
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response || err.response.status >= 500) {
        setError('Cannot connect to backend server. Please ensure the backend server is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Demo login failed. Check backend server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BookOpenCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-outfit">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to your Smart Library Management portal</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Sign In Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              ⚡ 1-Click Quick Demo Sign In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickDemo('admin@library.com', 'admin123')}
                className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Admin
              </button>

              <button
                onClick={() => handleQuickDemo('librarian@library.com', 'librarian123')}
                className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <BookMarked className="w-4 h-4 text-emerald-400" />
                Librarian
              </button>

              <button
                onClick={() => handleQuickDemo('student1@library.com', 'student123')}
                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1"
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                Student
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 font-bold hover:underline">
                Register as Member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
