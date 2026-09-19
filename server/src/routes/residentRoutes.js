const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');

router.get('/', residentController.getAllResidents);
router.post('/', residentController.createResident);
router.get('/:id', residentController.getResident);
router.put('/:id', residentController.updateResident);

module.exports = router;
