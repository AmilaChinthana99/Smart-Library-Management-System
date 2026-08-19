import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  BookOpen,
  Clock,
  DollarSign,
  BookmarkCheck,
  Calendar,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Bookmark,
  Layers,
} from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [activeLoans, setActiveLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);

  // Fine Payment Modal Simulator
  const [payModal, setPayModal] = useState({ isOpen: false, transaction: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch loans & history
      const transRes = await axios.get('/api/transactions');
      const allTrans = transRes.data.transactions || [];

      const active = allTrans.filter((t) => t.status === 'borrowed' || t.status === 'overdue');
      const past = allTrans.filter((t) => t.status === 'returned');

      setActiveLoans(active);
      setHistory(past);

      // Fetch member reservations
      const resRes = await axios.get('/api/reservations');
      setReservations(resRes.data.reservations || []);
    } catch (err) {
      console.error('Failed to load member dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate Total Unpaid Fine
  const totalUnpaidFine = activeLoans.reduce((sum, t) => sum + (t.fineAmount || 0), 0) +
    history.reduce((sum, t) => (!t.finePaid ? sum + (t.fineAmount || 0) : sum), 0);

  // Pay Fine Simulator
  const handlePayFineSubmit = async () => {
    if (!payModal.transaction) return;
    try {
      await axios.post(`/api/transactions/pay-fine/${payModal.transaction._id}`);
      setToast({ type: 'success', text: `Fine payment of $${payModal.transaction.fineAmount.toFixed(2)} completed!` });
      setPayModal({ isOpen: false, transaction: null });
      fetchNotifications();
      fetchData();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Payment simulation failed' });
    }
  };

  const handleCancelReservation = async (id) => {
    try {
      await axios.put(`/api/reservations/${id}/cancel`);
      setToast({ type: 'success', text: 'Reservation cancelled' });
      fetchNotifications();
      fetchData();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Cancel failed' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1.5 mb-2">
          <BookOpen className="w-3.5 h-3.5" /> Reader Member Console
        </span>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Welcome, {user?.name}</h1>
        <p className="text-xs text-slate-400">Track your currently borrowed books, due dates, reservations, and fine balances.</p>
      </div>

      {/* Toast Alert */}
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle="Books currently in your possession"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Book Reservations"
          value={reservations.filter((r) => r.status === 'pending' || r.status === 'ready').length}
          subtitle="Pending or ready for pickup"
          icon={BookmarkCheck}
          color="purple"
        />
        <StatCard
          title="Fine Owed"
          value={`$${totalUnpaidFine.toFixed(2)}`}
          subtitle={totalUnpaidFine > 0 ? 'Unpaid late fine balance' : 'No overdue fines'}
          icon={DollarSign}
          color={totalUnpaidFine > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Active Borrowed Books Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-outfit">Currently Borrowed Books</h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Loading active loans...</div>
        ) : activeLoans.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Active Borrowed Books</p>
            <p className="text-xs text-slate-500 mt-1">Browse the book catalog to borrow or reserve books.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeLoans.map((loan) => {
              const dueDateObj = new Date(loan.dueDate);
              const isOverdue = new Date() > dueDateObj;
              const daysLeft = Math.ceil((dueDateObj - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div key={loan._id} className="glass-card p-5 rounded-2xl border border-slate-700/80 flex items-start gap-4">
                  <img
                    src={loan.bookId?.coverImage}
                    alt={loan.bookId?.title}
                    className="w-16 h-24 rounded-xl object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-base font-bold text-white font-outfit line-clamp-1">{loan.bookId?.title}</h3>
                      <p className="text-xs text-slate-400">by {loan.bookId?.author}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-400">Due Date:</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-400 font-mono' : 'text-slate-200'}`}>
                        {dueDateObj.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Countdown / Overdue Banner */}
                    <div className="pt-2">
                      {isOverdue ? (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE ({Math.abs(daysLeft)} days late)
                          </span>
                          {loan.fineAmount > 0 && (
                            <button
                              onClick={() => setPayModal({ isOpen: true, transaction: loan })}
                              className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-500 transition-colors"
                            >
                              Pay ${loan.fineAmount.toFixed(2)}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
                          ⏳ {daysLeft} days remaining for return
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reservations & History 2-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reservations Queue Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-purple-400" /> Reserved Books Queue
          </h3>

          {reservations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">You have no active book reservations.</p>
          ) : (
            <div className="space-y-3">
              {reservations.map((r) => (
                <div key={r._id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.bookId?.title}</h4>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                        r.status === 'ready' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {r.status === 'ready' ? 'READY FOR PICKUP' : 'IN QUEUE (PENDING)'}
                    </span>
                  </div>

                  {r.status === 'pending' && (
                    <button
                      onClick={() => handleCancelReservation(r._id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Borrowing History Timeline */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Past Borrowing History
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No previous borrowing history.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h._id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white line-clamp-1">{h.bookId?.title}</h4>
                    <p className="text-[11px] text-slate-400">
                      Returned on: {h.returnDate ? new Date(h.returnDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-bold text-[10px]">
                    RETURNED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pay Fine Simulation Modal */}
      <Modal isOpen={payModal.isOpen} onClose={() => setPayModal({ isOpen: false, transaction: null })} title="Pay Library Overdue Fine">
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-center">
            <span className="text-slate-400 font-semibold uppercase tracking-wider block">Assessed Late Fine</span>
            <h3 className="text-3xl font-extrabold text-rose-400 font-outfit">
              ${(payModal.transaction?.fineAmount || 0).toFixed(2)}
            </h3>
            <p className="text-slate-500">Book: {payModal.transaction?.bookId?.title}</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
            💳 <strong>Instant Payment Simulator:</strong> Click below to simulate online card payment for instant fine clearance.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => setPayModal({ isOpen: false, transaction: null })}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handlePayFineSubmit}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" /> Confirm Payment (${(payModal.transaction?.fineAmount || 0).toFixed(2)})
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MemberDashboard;
