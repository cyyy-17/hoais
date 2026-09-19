const prisma = require('../utils/prisma');

// Get all facilities
exports.getAllFacilities = async (req, res, next) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.json(facilities);
  } catch (err) {
    next(err);
  }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        facility: true,
        resident: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// Create a booking
exports.createBooking = async (req, res, next) => {
  try {
    const { facilityId, residentId, date, timeFrom, timeTo } = req.body;
    const booking = await prisma.booking.create({
      data: {
        facilityId,
        residentId,
        date: new Date(date),
        timeFrom,
        timeTo,
        status: 'PENDING'
      }
    });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
