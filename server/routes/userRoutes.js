const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'librarian'), getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
