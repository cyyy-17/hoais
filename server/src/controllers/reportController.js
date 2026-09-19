const prisma = require('../utils/prisma');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalResidents = await prisma.resident.count();
    
    const dues = await prisma.dues.findMany({
      include: { payments: true }
    });
    
    let totalCollected = 0;
    let totalPending = 0;
    
    dues.forEach(d => {
      const paid = d.payments.reduce((sum, p) => sum + p.amount, 0);
      totalCollected += paid;
      if (d.status !== 'PAID') {
        totalPending += (d.amount - paid);
      }
    });

    const openTickets = await prisma.maintenance.count({
      where: { status: 'OPEN' }
    });

    res.json({
      totalResidents,
      totalCollected,
      totalPending,
      openTickets
    });
  } catch (err) {
    next(err);
  }
};
