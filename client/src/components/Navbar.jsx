import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDrawer from './NotificationDrawer';
import {
  BookOpenCheck,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  BookMarked,
  UserCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isLibrarian, isMember } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>;
    if (isLibrarian) return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Librarian</span>;
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">Member</span>;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpenCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white font-outfit tracking-wide block leading-none">Smart Library</span>
              <span className="text-xs text-blue-400 font-medium">Management System</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/catalog"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                location.pathname === '/catalog' || location.pathname === '/' ? 'text-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              Book Catalog
            </Link>

            {user && (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === '/admin' ? 'text-purple-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                {isLibrarian && (
                  <Link
                    to="/librarian"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === '/librarian' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <BookMarked className="w-4 h-4" />
                    Librarian Desk
                  </Link>
                )}

                {isMember && (
                  <Link
                    to="/member"
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      location.pathname === '/member' ? 'text-blue-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Notifications Bell */}
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                        {user.name}
                        {getRoleBadge()}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight">{user.email}</div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-blue-400" />
                        My Profile & Fines
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          Admin Console
                        </Link>
                      )}

                      {isLibrarian && (
                        <Link
                          to="/librarian"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <BookMarked className="w-4 h-4 text-emerald-400" />
                          Librarian Workstation
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border-t border-slate-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export default Navbar;
