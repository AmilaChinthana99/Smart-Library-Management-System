import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import {
  BookMarked,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  FolderPlus,
  BookmarkCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Clock,
} from 'lucide-react';

const LibrarianDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'transactions', 'reservations', 'overdue'

  // Books Inventory State
  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [bookPage, setBookPage] = useState(1);
  const [bookTotalPages, setBookTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [transPage, setTransPage] = useState(1);
  const [transTotalPages, setTransTotalPages] = useState(1);

  // Reservations State
  const [reservations, setReservations] = useState([]);

  // Users List (for Issue dropdowns)
  const [members, setMembers] = useState([]);

  // Toast Banner
  const [toast, setToast] = useState(null);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    ISBN: '',
    category: '',
    publisher: '',
    year: new Date().getFullYear(),
    totalCopies: 1,
    availableCopies: 1,
    coverImage: '',
    description: '',
    shelfLocation: 'A-101',
  });

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ bookId: '', userId: '', customLoanDays: 14 });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#3B82F6' });

  // Fetch Data Functions
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
      if (res.data.length > 0 && !bookForm.category) {
        setBookForm((prev) => ({ ...prev, category: res.data[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/books', {
        params: { search: bookSearch, page: bookPage, limit: 7 },
      });
      setBooks(res.data.books || []);
      setBookTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions', {
        params: { page: transPage, limit: 8 },
      });
      setTransactions(res.data.transactions || []);
      setTransTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get('/api/reservations', { params: { limit: 20 } });
      setReservations(res.data.reservations || []);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get('/api/users', { params: { role: 'member', limit: 100 } });
      setMembers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [bookSearch, bookPage]);

  useEffect(() => {
    fetchTransactions();
  }, [transPage]);

  useEffect(() => {
    fetchReservations();
  }, []);

  // Handle Create / Edit Book
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBookId) {
        await axios.put(`/api/books/${editingBookId}`, bookForm);
        setToast({ type: 'success', text: `Book '${bookForm.title}' updated successfully` });
      } else {
        await axios.post('/api/books', bookForm);
        setToast({ type: 'success', text: `New book '${bookForm.title}' added to catalog` });
      }
      setIsBookModalOpen(false);
      resetBookForm();
      fetchBooks();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to save book record' });
    }
  };

  const handleEditBookClick = (book) => {
    setEditingBookId(book._id);
    setBookForm({
      title: book.title,
      author: book.author,
      ISBN: book.ISBN,
      category: book.category?._id || book.category,
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      coverImage: book.coverImage || '',
      description: book.description || '',
      shelfLocation: book.shelfLocation || 'A-101',
    });
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}' from inventory?`)) return;
    try {
      await axios.delete(`/api/books/${bookId}`);
      setToast({ type: 'success', text: `Book '${title}' deleted` });
      fetchBooks();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const resetBookForm = () => {
    setEditingBookId(null);
    setBookForm({
      title: '',
      author: '',
      ISBN: '',
      category: categories[0]?._id || '',
      publisher: '',
      year: new Date().getFullYear(),
      totalCopies: 1,
      availableCopies: 1,
      coverImage: '',
      description: '',
      shelfLocation: 'A-101',
    });
  };

  // Handle Issue Book
  const handleIssueBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/transactions/issue', issueForm);
      setToast({ type: 'success', text: res.data.message });
      setIsIssueModalOpen(false);
      setIssueForm({ bookId: '', userId: '', customLoanDays: 14 });
      fetchBooks();
      fetchTransactions();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to issue book' });
    }
  };

  // Handle Return Book
  const handleReturnBook = async (transactionId) => {
    try {
      const res = await axios.post('/api/transactions/return', { transactionId });
      const fine = res.data.fineAmount;
      setToast({
        type: 'success',
        text: `Book returned successfully.${fine > 0 ? ` Overdue fine assessed: $${fine.toFixed(2)}` : ''}`,
      });
      fetchBooks();
      fetchTransactions();
      fetchReservations();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to process return' });
    }
  };

  // Handle Create Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/categories', categoryForm);
      setToast({ type: 'success', text: `Category genre '${categoryForm.name}' created!` });
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '', color: '#3B82F6' });
      fetchCategories();
    } catch (err) {
      setToast({ type: 'error', text: err.response?.data?.message || 'Failed to create category' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5 mb-2">
            <BookMarked className="w-3.5 h-3.5" /> Librarian Desk Console
          </span>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Inventory & Circulation Desk</h1>
          <p className="text-xs text-slate-400">Manage book stock, issue loans, process returns, and handle reservations.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              resetBookForm();
              setIsBookModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" /> Add New Book
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <ArrowUpRight className="w-4 h-4" /> Quick Issue Book
          </button>

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-purple-400" /> New Genre
          </button>
        </div>
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Catalog Inventory ({books.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Active & Returned Loans
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'reservations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5 text-purple-400" />
          Pending Queue ({reservations.length})
        </button>
      </div>

      {/* Tab 1: Book Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white font-outfit">Catalog Books List</h3>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search title, ISBN, author..."
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setBookPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Book Record</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Shelf</th>
                  <th className="p-3">Stock (Avail/Total)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="w-9 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white line-clamp-1">{b.title}</div>
                        <div className="text-[11px] text-slate-400">by {b.author}</div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{b.ISBN}</td>
                    <td className="p-3">
                      {b.category && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: b.category.color || '#3b82f6' }}
                        >
                          {b.category.name}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-blue-400 font-bold">{b.shelfLocation || 'A-101'}</td>
                    <td className="p-3">
                      <span
                        className={`font-bold ${
                          b.availableCopies > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {b.availableCopies} / {b.totalCopies}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleEditBookClick(b)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                        title="Edit book record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(b._id, b.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete book record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={bookPage} totalPages={bookTotalPages} onPageChange={(p) => setBookPage(p)} />
        </div>
      )}

      {/* Tab 2: Transactions & Circulation Desk */}
      {activeTab === 'transactions' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit">Borrowing & Return Records</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Borrowed By</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status / Fine</th>
                  <th className="p-3 text-right">Return Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{t.bookId?.title || 'Unknown Book'}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{t.userId?.name}</div>
                      <div className="text-[10px] text-slate-500">{t.userId?.email}</div>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(t.issueDate).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-amber-400">{new Date(t.dueDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'returned'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : t.status === 'overdue' || new Date(t.dueDate) < new Date()
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                      {t.fineAmount > 0 && (
                        <div className="text-[10px] text-rose-400 font-bold mt-0.5">
                          Fine: ${t.fineAmount.toFixed(2)} ({t.finePaid ? 'Paid' : 'Unpaid'})
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {t.status !== 'returned' ? (
                        <button
                          onClick={() => handleReturnBook(t._id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Process Return
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-semibold">Returned ({t.returnDate ? new Date(t.returnDate).toLocaleDateString() : ''})</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={transPage} totalPages={transTotalPages} onPageChange={(p) => setTransPage(p)} />
        </div>
      )}

      {/* Tab 3: Reservation Queue */}
      {activeTab === 'reservations' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 space-y-4">
          <h3 className="text-base font-bold text-white font-outfit">Reservation Waiting Queue</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Reserved By</th>
                  <th className="p-3">Reservation Date</th>
                  <th className="p-3">Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">{r.bookId?.title}</td>
                    <td className="p-3">{r.userId?.name} ({r.userId?.email})</td>
                    <td className="p-3 text-slate-400">{new Date(r.reservationDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'ready'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title={editingBookId ? 'Edit Book Record' : 'Add New Book to Inventory'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveBook} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Book Title</label>
              <input
                type="text"
                required
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Author Name</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">ISBN Code</label>
              <input
                type="text"
                required
                value={bookForm.ISBN}
                onChange={(e) => setBookForm({ ...bookForm, ISBN: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category / Genre</label>
              <select
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Publisher</label>
              <input
                type="text"
                value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Total Stock Copies</label>
              <input
                type="number"
                min="1"
                required
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Shelf Location Code</label>
              <input
                type="text"
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Cover Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={bookForm.coverImage}
                onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Synopsis / Description</label>
            <textarea
              rows={3}
              value={bookForm.description}
              onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
            >
              Save Book Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      <Modal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} title="Issue Book to Member">
        <form onSubmit={handleIssueBookSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Book</label>
            <select
              required
              value={issueForm.bookId}
              onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="">-- Choose Book --</option>
              {books.map((b) => (
                <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Select Member</label>
            <select
              required
              value={issueForm.userId}
              onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Loan Period (Days)</label>
            <input
              type="number"
              min="1"
              value={issueForm.customLoanDays}
              onChange={(e) => setIssueForm({ ...issueForm, customLoanDays: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25"
            >
              Issue Book Now
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Create New Book Genre">
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Genre Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Theme Color</label>
            <input
              type="color"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LibrarianDashboard;
