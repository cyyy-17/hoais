const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'HOA_ADMIN', 'BOARD_MEMBER'));

// HOA Profile
router.route('/profile')
  .get(settingsController.getProfile)
  .put(settingsController.updateProfile);

// Board Members
router.route('/board')
  .get(settingsController.getBoardMembers)
  .post(settingsController.addBoardMember);

router.route('/board/:id')
  .put(settingsController.updateBoardMember)
  .delete(settingsController.removeBoardMember);

module.exports = router;
