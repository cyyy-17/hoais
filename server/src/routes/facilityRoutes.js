const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facilityController');

router.get('/', facilityController.getAllFacilities);
router.get('/bookings', facilityController.getAllBookings);
router.post('/bookings', facilityController.createBooking);
router.patch('/bookings/:id/status', facilityController.updateBookingStatus);

module.exports = router;
