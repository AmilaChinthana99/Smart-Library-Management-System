import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  ShieldCheck,
  Users,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  UserPlus,
  Settings,
  Trash2,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Users State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    fineRatePerDay: 1.5,
    maxLoanDays: 14,
    maxBooksPerMember: 5,
    maxUnpaidFineThreshold: 10,
    libraryName: 'Smart Library',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Modal Controls
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'librarian',
    phone: '',
    address: '',
  });

  const [toast, setToast] = useState(null);

  const fetchDashboardMetrics = async () => {
    try {
      const res = await axios.get('/api/reports/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/users', {
        params: {
          role: userRoleFilter,
          search: userSearch,
          page: userPage,
          limit: 6,
        },
      });
      setUsers(res.data.users || []);
      setUserTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter, userSearch, userPage]);

  // Handle User Creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users', newUserForm);
      setToast({ type: 'success', text: `New ${newUserForm.role} created successfully!` });
      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'librarian', phone: '', address: '' });
      fetchUsers();
      fetchDashboardMetrics();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    }
  };

  // Toggle User Status (Active / Inactive)
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`/api/users/${userId}/status`, { status: nextStatus });
      setToast({ type: 'success', text: `User account status changed to ${nextStatus}` });
      fetchUsers();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Status change failed' });
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      setToast({ type: 'success', text: 'User account deleted' });
      fetchUsers();
      fetchDashboardMetrics();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Delete user failed' });
    }
  };

  // Update Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await axios.put('/api/settings', settings);
      setToast({ type: 'success', text: 'Library configuration saved successfully!' });
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Save settings failed' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Trigger CSV or PDF downloads
  const handleExport = (endpoint, filename) => {
    const token = localStorage.getItem('library_token');
    window.open(`${endpoint}?token=${token}`, '_blank');
  };

  const summary = metrics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 inline-flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrative Control Center
          </span>
          <h1 className="text-3xl font-extrabold text-white font-outfit">System Overview & Analytics</h1>
          <p className="text-xs text-slate-400">Monitor library operations, staff accounts, fines, and export reports.</p>
        </div>

        {/* Report Download Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('/api/reports/export/csv?type=inventory')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> CSV Inventory
          </button>
          <button
            onClick={() => handleExport('/api/reports/export/csv?type=transactions')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" /> CSV Loans
          </button>
          <button
            onClick={() => handleExport('/api/reports/export/pdf')}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {toast.text}
          </div>
          <button onClick={() => setToast(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Catalog Books"
          value={summary.totalBooks || 0}
          subtitle={`${summary.availableCopies || 0} copies ready on shelf`}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Registered Members"
          value={summary.totalMembers || 0}
          subtitle={`${summary.totalLibrarians || 0} active librarian staff`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Active Loans"
          value={summary.activeLoans || 0}
          subtitle={`${summary.overdueCount || 0} overdue books currently`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Fines Collected"
          value={`$${(summary.finesCollected || 0).toFixed(2)}`}
          subtitle={`$${(summary.unpaidFines || 0).toFixed(2)} pending collection`}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrowing Trends AreaChart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-outfit">Borrowing & Return Velocity</h3>
              <p className="text-xs text-slate-400">Monthly circulation breakdown</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live Trend
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {metrics?.monthlyBorrowingTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyBorrowingTrend}>
                  <defs>
                    <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="borrowed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBorrowed)" name="Borrowed" />
                  <Area type="monotone" dataKey="returned" stroke="#10b981" fillOpacity={1} fill="url(#colorReturned)" name="Returned" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading chart data...</div>
            )}
          </div>
        </div>

        {/* Category Breakdown PieChart */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit">Inventory by Genre</h3>
          <p className="text-xs text-slate-400">Category share in library catalog</p>

          <div className="h-48 w-full">
            {metrics?.categoryDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.categoryDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {metrics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {metrics?.categoryDistribution?.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-bold text-white">{cat.count} books</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Settings & User Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Accounts Management (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-outfit">Staff & Member Accounts</h3>
              <p className="text-xs text-slate-400">Manage user access privileges, roles, and status</p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Add User / Staff
            </button>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUserPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All User Roles</option>
              <option value="librarian">Librarians Only</option>
              <option value="member">Members Only</option>
              <option value="admin">Admins Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Loading user database records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      No matching users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : u.role === 'librarian'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{u.phone || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
                        >
                          {u.status === 'active' ? <UserX className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={(p) => setUserPage(p)} />
        </div>

        {/* Library Settings Panel (1 col) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" /> Library Policy Settings
            </h3>
            <p className="text-xs text-slate-400">Configure fine rates, max loan periods, and limit rules</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Library Name</label>
              <input
                type="text"
                value={settings.libraryName || ''}
                onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Overdue Fine Rate ($ / Day)</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={settings.fineRatePerDay || 1.5}
                onChange={(e) => setSettings({ ...settings, fineRatePerDay: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Default Loan Duration (Days)</label>
              <input
                type="number"
                min="1"
                value={settings.maxLoanDays || 14}
                onChange={(e) => setSettings({ ...settings, maxLoanDays: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Books Allowed Per Member</label>
              <input
                type="number"
                min="1"
                value={settings.maxBooksPerMember || 5}
                onChange={(e) => setSettings({ ...settings, maxBooksPerMember: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Unpaid Fine Threshold ($ Block)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={settings.maxUnpaidFineThreshold || 10}
                onChange={(e) => setSettings({ ...settings, maxUnpaidFineThreshold: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              {savingSettings ? 'Saving Configuration...' : 'Save Library Policies'}
            </button>
          </form>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Create New Account / Staff">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Account Role</label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="librarian">Librarian Staff</option>
              <option value="member">Library Member / Student</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Sarah Connor"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="staff@library.com"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newUserForm.password}
              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+1 (555) 000-0000"
              value={newUserForm.phone}
              onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
