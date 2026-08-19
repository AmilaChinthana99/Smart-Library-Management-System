const express = require('express');
const router = express.Router();
const { getDashboardMetrics, exportCSV, exportPDF } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin', 'librarian'), getDashboardMetrics);
router.get('/export/csv', protect, authorize('admin', 'librarian'), exportCSV);
router.get('/export/pdf', protect, authorize('admin', 'librarian'), exportPDF);

module.exports = router;
