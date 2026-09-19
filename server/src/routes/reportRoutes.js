const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/revenue', protect, restrictTo('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getRevenueMetrics);
router.get('/maintenance-summary', protect, restrictTo('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getMaintenanceSummary);
router.get('/activity', protect, restrictTo('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getActivityFeed);
router.get('/alerts', protect, restrictTo('SUPER_ADMIN', 'HOA_ADMIN'), reportController.getAlerts);

module.exports = router;
