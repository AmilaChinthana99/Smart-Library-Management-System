import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Filter, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const CatalogPage = () => {
  const { isMember } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [alertMsg, setAlertMsg] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/books', {
        params: {
          search,
          category: selectedCategory,
          availability,
          sortBy,
          page,
          limit: 8,
        },
      });
      setBooks(res.data.books || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory, availability, sortBy, page]);

  const handleReserve = async (bookId) => {
    try {
      const res = await axios.post('/api/reservations', { bookId });
      setAlertMsg({ type: 'success', text: res.data.message });
      fetchNotifications();
      fetchBooks();
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Failed to place reservation' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-700/80 p-6 sm:p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Digital Inventory Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight">
            Discover & Reserve Books Digitally
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Search through our smart digital repository. Check real-time shelf availability, category genres, and place instant reservation queues.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by Title, Author, ISBN, or Publisher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Availability Select */}
          <div>
            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Availability</option>
              <option value="available">In Stock Only</option>
              <option value="out_of_stock">Out of Stock (Queue)</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="newest">Sort by Newest</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="popularity">Most Copies</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All Categories ({totalCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setSelectedCategory(cat._id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat._id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
              {cat.name} ({cat.bookCount || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            alertMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {alertMsg.text}
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Books Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} book={book} onReserve={handleReserve} isMember={isMember} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
    </div>
  );
};

export default CatalogPage;
