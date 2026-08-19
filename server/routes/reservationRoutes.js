const express = require('express');
const router = express.Router();
const {
  placeReservation,
  getReservations,
  cancelReservation,
  updateReservationStatus,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, placeReservation);
router.get('/', protect, getReservations);
router.put('/:id/cancel', protect, cancelReservation);
router.put('/:id/status', protect, authorize('admin', 'librarian'), updateReservationStatus);

module.exports = router;
