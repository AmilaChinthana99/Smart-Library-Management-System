import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const BookCard = ({ book, onReserve, isMember }) => {
  const isAvailable = book.availableCopies > 0;
  const availabilityPercent = Math.min(100, Math.round((book.availableCopies / book.totalCopies) * 100));

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
      {/* Cover Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-800">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Category Badge */}
        {book.category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-lg backdrop-blur-md"
            style={{ backgroundColor: book.category.color ? `${book.category.color}dd` : '#3b82f6dd' }}
          >
            {book.category.name}
          </span>
        )}

        {/* Shelf Location Code */}
        <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-slate-300 border border-slate-700 flex items-center gap-1 backdrop-blur-md">
          <MapPin className="w-3 h-3 text-blue-400" />
          {book.shelfLocation || 'Shelf A1'}
        </span>

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md ${
            isAvailable ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {isAvailable ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {book.availableCopies} of {book.totalCopies} Available
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Out of Stock (Reserved Queue)
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-outfit line-clamp-1 group-hover:text-blue-400 transition-colors" title={book.title}>
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">by {book.author}</p>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {book.description || 'No description provided for this library catalog book.'}
          </p>
        </div>

        {/* Stock Indicator Progress */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isAvailable ? 'bg-blue-500' : 'bg-rose-500'}`}
              style={{ width: `${availabilityPercent}%` }}
            ></div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Link
              to={`/books/${book._id}`}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors text-center flex items-center justify-center gap-1.5"
            >
              Details
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {isMember && !isAvailable && (
              <button
                onClick={() => onReserve(book._id)}
                className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Reserve this book"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Reserve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
