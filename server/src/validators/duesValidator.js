const { z } = require('zod');

exports.createDueSchema = z.object({
  residentId: z.string().uuid(),
  amount: z.number().positive(),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be YYYY-MM format'),
  dueDate: z.string().datetime().or(z.date()),
});

exports.recordPaymentSchema = z.object({
  duesId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH']),
  referenceNo: z.string().optional(),
});
