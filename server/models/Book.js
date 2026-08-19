const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    publisher: {
      type: String,
      default: 'Unknown Publisher',
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, 'Total copies must be at least 1'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    description: {
      type: String,
      default: '',
    },
    shelfLocation: {
      type: String,
      default: 'A-101',
    },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', ISBN: 'text' });

module.exports = mongoose.model('Book', bookSchema);
