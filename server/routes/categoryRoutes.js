const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/', protect, authorize('admin', 'librarian'), createCategory);
router.put('/:id', protect, authorize('admin', 'librarian'), updateCategory);
router.delete('/:id', protect, authorize('admin', 'librarian'), deleteCategory);

module.exports = router;
