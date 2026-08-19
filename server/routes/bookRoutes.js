const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, authorize('admin', 'librarian'), upload.single('coverImage'), createBook);
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('coverImage'), updateBook);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteBook);

module.exports = router;
