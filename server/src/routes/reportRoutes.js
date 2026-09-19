const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/revenue', protect, authorize('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getRevenueMetrics);
router.get('/maintenance-summary', protect, authorize('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getMaintenanceSummary);
router.get('/activity', protect, authorize('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getActivityFeed);
router.get('/alerts', protect, authorize('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getAlerts);

module.exports = router;
