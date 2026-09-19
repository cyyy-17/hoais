const { z } = require('zod');

exports.createBookingSchema = z.object({
  facilityId: z.string().uuid(),
  residentId: z.string().uuid(),
  date: z.string().datetime().or(z.date()),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
});

exports.updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});
