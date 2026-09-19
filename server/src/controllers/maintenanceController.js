const prisma = require('../utils/prisma');

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
    const { residentId, category, description } = req.body;
    const ticket = await prisma.maintenance.create({
      data: {
        residentId,
        category,
        description,
        status: 'OPEN'
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await prisma.maintenance.update({
      where: { id: req.params.id },
      data: { status, assignedTo }
    });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};
