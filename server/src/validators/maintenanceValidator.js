const { z } = require('zod');

exports.createMaintenanceSchema = z.object({
  residentId: z.string().uuid(),
  category: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().optional(),
});

exports.updateMaintenanceSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  assignedTo: z.string().optional(),
});
