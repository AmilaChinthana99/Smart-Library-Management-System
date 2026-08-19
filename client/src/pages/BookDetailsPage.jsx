import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Barcode,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Clock,
  Layers,
} from 'lucide-react';

const BookDetailsPage = () => {
  const { id } = useParams();
  const { isMember, isLibrarian } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [book, setBook] = useState(null);
  const [pendingReservationsCount, setPendingReservationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchBookDetails = async () => {
    try {
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.book);
      setPendingReservationsCount(res.data.pendingReservationsCount || 0);
    } catch (err) {
      console.error('Failed to load book details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleReserve = async () => {
    try {
      const res = await axios.post('/api/reservations', { bookId: id });
      setMsg({ type: 'success', text: res.data.message });
      fetchNotifications();
      fetchBookDetails();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to place reservation' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 animate-pulse">
        Loading detailed book record...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-white">Book Not Found</h2>
        <Link to="/catalog" className="text-blue-400 hover:underline text-sm mt-2 block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/catalog"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Alert Message */}
      {msg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Details Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cover Image Column */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800 h-80">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Shelf Location</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 font-mono font-bold text-sm border border-blue-500/20">
              <MapPin className="w-4 h-4" />
              {book.shelfLocation || 'A-101'}
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-2 space-y-6 flex flex-col justify-between">
          <div>
            {book.category && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white inline-block mb-3 shadow-md"
                style={{ backgroundColor: book.category.color || '#3b82f6' }}
              >
                {book.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">{book.title}</h1>
            <p className="text-sm font-semibold text-slate-300 mt-1">by {book.author}</p>

            {/* Description */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Book Synopsis</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {book.description || 'No detailed description available for this volume.'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <Barcode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">ISBN</p>
                  <p className="text-xs font-mono font-bold text-slate-200">{book.ISBN}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Publisher</p>
                  <p className="text-xs font-semibold text-slate-200">{book.publisher}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Publication Year</p>
                  <p className="text-xs font-semibold text-slate-200">{book.year}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action & Availability Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={`p-3 rounded-2xl flex items-center justify-center ${
                isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {isAvailable ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Availability Status</span>
                <span className="text-sm font-extrabold text-white">
                  {book.availableCopies} of {book.totalCopies} copies ready
                </span>
                {pendingReservationsCount > 0 && (
                  <span className="text-[11px] text-purple-400 block font-medium">
                    ({pendingReservationsCount} in reservation queue)
                  </span>
                )}
              </div>
            </div>

            {isMember && !isAvailable && (
              <button
                onClick={handleReserve}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Bookmark className="w-4 h-4" /> Reserve Out-of-Stock Book
              </button>
            )}

            {isLibrarian && (
              <Link
                to="/librarian"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Go to Librarian Desk to Issue
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
