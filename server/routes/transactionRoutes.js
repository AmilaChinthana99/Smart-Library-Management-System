const express = require('express');
const router = express.Router();
const { issueBook, returnBook, payFine, getTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTransactions);
router.post('/issue', protect, authorize('admin', 'librarian'), issueBook);
router.post('/return', protect, authorize('admin', 'librarian'), returnBook);
router.post('/pay-fine/:id', protect, payFine);

module.exports = router;
