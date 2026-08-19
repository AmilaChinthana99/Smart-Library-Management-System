const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Setting = require('../models/Setting');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');

// Helper to fetch current system settings
const getSystemSettings = async () => {
  let setting = await Setting.findOne();
  if (!setting) {
    setting = await Setting.create({});
  }
  return setting;
};

// @desc    Issue a book to a member (Librarian/Admin action)
// @route   POST /api/transactions/issue
// @access  Private (Librarian/Admin)
exports.issueBook = async (req, res, next) => {
  try {
    const { bookId, userId, customLoanDays } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is currently out of stock. Member can place a reservation.' });
    }

    const member = await User.findById(userId);
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Invalid member ID provided' });
    }

    if (member.status === 'inactive') {
      return res.status(400).json({ message: 'Member account is deactivated' });
    }

    const settings = await getSystemSettings();

    // Check unpaid fines threshold
    const unpaidTransactions = await Transaction.find({
      userId,
      finePaid: false,
      fineAmount: { $gt: 0 },
    });
    const totalUnpaidFine = unpaidTransactions.reduce((sum, t) => sum + t.fineAmount, 0);

    if (totalUnpaidFine > settings.maxUnpaidFineThreshold) {
      return res.status(400).json({
        message: `Cannot issue book. Member has unpaid fines of $${totalUnpaidFine.toFixed(2)}, exceeding maximum allowed threshold of $${settings.maxUnpaidFineThreshold.toFixed(2)}`,
      });
    }

    // Check active loans limit
    const activeLoansCount = await Transaction.countDocuments({
      userId,
      status: { $in: ['borrowed', 'overdue'] },
    });

    if (activeLoansCount >= settings.maxBooksPerMember) {
      return res.status(400).json({
        message: `Member has reached maximum limit of ${settings.maxBooksPerMember} borrowed books.`,
      });
    }

    // Check if member already has an active loan for this exact book
    const existingLoan = await Transaction.findOne({
      userId,
      bookId,
      status: { $in: ['borrowed', 'overdue'] },
    });
    if (existingLoan) {
      return res.status(400).json({ message: 'Member already has an active loan for this book' });
    }

    // Calculate Due Date
    const loanDays = customLoanDays ? parseInt(customLoanDays, 10) : settings.maxLoanDays;
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + loanDays);

    // Create Transaction record
    const transaction = await Transaction.create({
      bookId,
      userId,
      issueDate,
      dueDate,
      status: 'borrowed',
      issuedBy: req.user.id,
    });

    // Decrease book available copies
    book.availableCopies -= 1;
    await book.save();

    // Fulfill reservation if this member had a pending/ready reservation
    await Reservation.findOneAndUpdate(
      { bookId, userId, status: { $in: ['pending', 'ready'] } },
      { status: 'fulfilled' }
    );

    // Send Notification to Member
    await Notification.create({
      userId,
      message: `Book '${book.title}' has been issued to you. Due date: ${dueDate.toLocaleDateString()}`,
      type: 'general',
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author coverImage ISBN')
      .populate('userId', 'name email phone');

    res.status(201).json({
      message: 'Book issued successfully',
      transaction: populatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process Return of a borrowed book
// @route   POST /api/transactions/return
// @access  Private (Librarian/Admin)
exports.returnBook = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('bookId')
      .populate('userId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction record not found' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ message: 'This book transaction has already been returned' });
    }

    const returnDate = new Date();
    const settings = await getSystemSettings();

    // Calculate late fine
    let fineAmount = 0;
    if (returnDate > transaction.dueDate) {
      const diffTime = Math.abs(returnDate - transaction.dueDate);
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = Math.round(overdueDays * settings.fineRatePerDay * 100) / 100;
    }

    transaction.returnDate = returnDate;
    transaction.status = 'returned';
    transaction.fineAmount = fineAmount;
    transaction.returnedTo = req.user.id;
    await transaction.save();

    // Restock book available count
    const book = await Book.findById(transaction.bookId._id);
    if (book) {
      book.availableCopies += 1;
      await book.save();

      // Check reservation queue for next member waiting!
      const nextReservation = await Reservation.findOne({
        bookId: book._id,
        status: 'pending',
      }).sort({ createdAt: 1 });

      if (nextReservation) {
        nextReservation.status = 'ready';
        nextReservation.readyUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days hold period
        await nextReservation.save();

        await Notification.create({
          userId: nextReservation.userId,
          message: `The book '${book.title}' you reserved is now available! Please pick it up within 3 days.`,
          type: 'reservation_ready',
        });
      }
    }

    // Send Notification to returnee
    await Notification.create({
      userId: transaction.userId._id,
      message: `Book '${transaction.bookId.title}' was returned successfully.${fineAmount > 0 ? ` Overdue fine assessed: $${fineAmount.toFixed(2)}.` : ''}`,
      type: fineAmount > 0 ? 'overdue' : 'general',
    });

    res.json({
      message: 'Book returned successfully',
      fineAmount,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay fine for a transaction
// @route   POST /api/transactions/pay-fine/:id
// @access  Private
exports.payFine = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.fineAmount <= 0) {
      return res.status(400).json({ message: 'No fine is assessed for this transaction' });
    }

    if (transaction.finePaid) {
      return res.status(400).json({ message: 'Fine has already been paid' });
    }

    transaction.finePaid = true;
    await transaction.save();

    await Notification.create({
      userId: transaction.userId,
      message: `Payment of $${transaction.fineAmount.toFixed(2)} received for transaction on book.`,
      type: 'general',
    });

    res.json({
      message: 'Fine paid successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transaction logs (Admin/Librarian) or Member's transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { status, userId, page = 1, limit = 10 } = req.query;

    let query = {};

    // Role check: Members can only see their own transactions
    if (req.user.role === 'member') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('bookId', 'title author coverImage ISBN shelfLocation')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};
