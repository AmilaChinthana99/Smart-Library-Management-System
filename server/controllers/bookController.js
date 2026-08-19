const Book = require('../models/Book');
const Category = require('../models/Category');
const Reservation = require('../models/Reservation');

// @desc    Get all books with filtering, searching, sorting, pagination
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category, availability, sortBy, page = 1, limit = 10 } = req.query;

    let query = {};

    // Text search or regex match
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { ISBN: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Availability Filter
    if (availability === 'available') {
      query.availableCopies = { $gt: 0 };
    } else if (availability === 'out_of_stock') {
      query.availableCopies = 0;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'title_asc') sortOptions = { title: 1 };
    if (sortBy === 'title_desc') sortOptions = { title: -1 };
    if (sortBy === 'year_desc') sortOptions = { year: -1 };
    if (sortBy === 'popularity') sortOptions = { totalCopies: -1 };

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('category', 'name color')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(limitNum);

    res.json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name description color');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Count pending reservations
    const pendingReservationsCount = await Reservation.countDocuments({
      bookId: book._id,
      status: 'pending',
    });

    res.json({
      book,
      pendingReservationsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book record
// @route   POST /api/books
// @access  Private (Librarian/Admin)
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, ISBN, category, publisher, year, totalCopies, availableCopies, coverImage, description, shelfLocation } = req.body;

    const isbnExists = await Book.findOne({ ISBN });
    if (isbnExists) {
      return res.status(400).json({ message: `Book with ISBN '${ISBN}' already exists` });
    }

    const total = parseInt(totalCopies || 1, 10);
    const avail = availableCopies !== undefined ? parseInt(availableCopies, 10) : total;

    const book = await Book.create({
      title,
      author,
      ISBN,
      category,
      publisher,
      year: year || new Date().getFullYear(),
      totalCopies: total,
      availableCopies: avail,
      coverImage: req.file ? `/uploads/${req.file.filename}` : (coverImage || undefined),
      description,
      shelfLocation,
    });

    const populatedBook = await Book.findById(book._id).populate('category', 'name color');

    res.status(201).json({
      message: 'Book added successfully',
      book: populatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
// @access  Private (Librarian/Admin)
exports.updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updateFields = { ...req.body };
    if (req.file) {
      updateFields.coverImage = `/uploads/${req.file.filename}`;
    }

    // Maintain correct available copies math if total copies updated
    if (updateFields.totalCopies !== undefined) {
      const diff = parseInt(updateFields.totalCopies, 10) - book.totalCopies;
      updateFields.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    book = await Book.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('category', 'name color');

    res.json({
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book record
// @route   DELETE /api/books/:id
// @access  Private (Librarian/Admin)
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.deleteOne();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};
