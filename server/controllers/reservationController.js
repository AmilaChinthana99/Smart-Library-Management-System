const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Notification = require('../models/Notification');

// @desc    Place a book reservation (Member action)
// @route   POST /api/reservations
// @access  Private (Member/All)
exports.placeReservation = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has an active reservation for this book
    const existingRes = await Reservation.findOne({
      bookId,
      userId,
      status: { $in: ['pending', 'ready'] },
    });

    if (existingRes) {
      return res.status(400).json({ message: 'You already have an active reservation for this book' });
    }

    const reservation = await Reservation.create({
      bookId,
      userId,
      status: book.availableCopies > 0 ? 'ready' : 'pending',
      readyUntil: book.availableCopies > 0 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null,
    });

    // Notify member
    await Notification.create({
      userId,
      message: `Reservation placed for '${book.title}'. ${book.availableCopies > 0 ? 'Status: Ready for pickup!' : 'Status: Added to queue.'}`,
      type: book.availableCopies > 0 ? 'reservation_ready' : 'general',
    });

    const populatedRes = await Reservation.findById(reservation._id)
      .populate('bookId', 'title author coverImage ISBN shelfLocation')
      .populate('userId', 'name email');

    res.status(201).json({
      message: 'Reservation placed successfully',
      reservation: populatedRes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user or system-wide reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    if (req.user.role === 'member') {
      query.userId = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .populate('bookId', 'title author coverImage ISBN availableCopies shelfLocation')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.json({
      success: true,
      count: reservations.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Verify ownership or staff permissions
    if (req.user.role === 'member' && reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (Librarian action)
// @route   PUT /api/reservations/:id/status
// @access  Private (Librarian/Admin)
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = status;
    await reservation.save();

    await Notification.create({
      userId: reservation.userId,
      message: `Your reservation status for book has been updated to: ${status}`,
      type: status === 'ready' ? 'reservation_ready' : 'general',
    });

    res.json({
      message: 'Reservation status updated',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
