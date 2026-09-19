const prisma = require('../utils/prisma');
const { createBookingSchema, updateBookingSchema } = require('../validators/facilityValidator');
const auditService = require('../services/auditService');

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
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { facilityId, residentId, date, timeFrom, timeTo } = parsed.data;
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
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'CREATE_BOOKING', 'BOOKING', booking.id);
    
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const parsed = updateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { status } = parsed.data;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'UPDATE_BOOKING_STATUS', 'BOOKING', booking.id);
    
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
