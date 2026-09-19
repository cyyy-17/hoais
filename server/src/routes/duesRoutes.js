const express = require('express');
const router = express.Router();
const duesController = require('../controllers/duesController');

router.get('/', duesController.getAllDues);
router.post('/', duesController.createDues);
router.post('/payment', duesController.recordPayment);

module.exports = router;
