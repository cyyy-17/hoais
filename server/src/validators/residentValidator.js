const { z } = require('zod');

exports.createResidentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  block: z.string().min(1, 'Block is required'),
  lot: z.string().min(1, 'Lot is required'),
  moveInDate: z.string().datetime().or(z.date()),
  status: z.enum(['ACTIVE', 'DELINQUENT', 'RENTING', 'ARCHIVED']).optional(),
});

exports.updateResidentSchema = z.object({
  block: z.string().optional(),
  lot: z.string().optional(),
  status: z.enum(['ACTIVE', 'DELINQUENT', 'RENTING', 'ARCHIVED']).optional(),
});
