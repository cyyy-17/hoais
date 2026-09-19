const prisma = require('../utils/prisma');
const { createMaintenanceSchema, updateMaintenanceSchema } = require('../validators/maintenanceValidator');
const auditService = require('../services/auditService');

exports.getAllMaintenance = async (req, res, next) => {
  try {
    const tickets = await prisma.maintenance.findMany({
      include: {
        resident: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

exports.createMaintenance = async (req, res, next) => {
  try {
    const parsed = createMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { residentId, category, description } = parsed.data;
    
    const ticket = await prisma.maintenance.create({
      data: {
        residentId,
        category,
        description,
        status: 'OPEN'
      }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'CREATE_MAINTENANCE_TICKET', 'MAINTENANCE', ticket.id);
    
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const parsed = updateMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { status, assignedTo } = parsed.data;
    
    const ticket = await prisma.maintenance.update({
      where: { id: req.params.id },
      data: { status, assignedTo }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'UPDATE_MAINTENANCE_TICKET', 'MAINTENANCE', ticket.id);
    
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};
