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

exports.getAnalytics = async (req, res, next) => {
  try {
    const range = req.query.range || '6M';
    
    // In a real app we'd filter by range, but for T2 we will just send real db aggregates
    // 1. KPIs
    const dues = await prisma.dues.findMany({
      include: { payments: true, resident: true }
    });
    
    let totalRevenueYTD = 0;
    let totalExpected = 0;
    let totalResidentsWithDues = new Set();

    // Fake months mapping for revenueData
    const revenueMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => {
      revenueMap[m] = 0;
    });

    dues.forEach(d => {
      totalExpected += d.amount;
      const paid = d.payments.reduce((sum, p) => sum + p.amount, 0);
      totalRevenueYTD += paid;
      if (d.residentId) totalResidentsWithDues.add(d.residentId);
      
      // Add to revenue trend (simplistic grouping by due date month for demo)
      const dueMonth = new Date(d.dueDate).getMonth();
      revenueMap[months[dueMonth]] += paid;
    });

    const collectionRate = totalExpected > 0 ? Math.round((totalRevenueYTD / totalExpected) * 100) : 0;
    const avgPayment = totalResidentsWithDues.size > 0 ? Math.round(totalRevenueYTD / totalResidentsWithDues.size) : 0;

    const openTickets = await prisma.maintenance.count({
      where: { status: 'OPEN' }
    });

    const kpis = [
      { label: 'Total Revenue (YTD)', value: `₱ ${totalRevenueYTD.toLocaleString()}`, subtitle: 'Active collection' },
      { label: 'Collection Rate', value: `${collectionRate}%`, subtitle: 'Target: 95%' },
      { label: 'Avg Payment / Resident', value: `₱ ${avgPayment.toLocaleString()}`, subtitle: 'Based on total collected' },
      { label: 'Total Open Tickets', value: openTickets.toString(), subtitle: 'Needs attention' },
    ];

    // 2. Revenue Trend Data
    const revenueData = Object.keys(revenueMap).slice(0, 6).map(name => ({
      name,
      amount: revenueMap[name],
      target: 40000
    }));

    // 3. Maintenance Category Data
    const maintenanceGroups = await prisma.maintenance.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    const colorMap = {
      'Plumbing': 'var(--neu-primary)',
      'Electrical': 'var(--neu-warning)',
      'Landscaping': 'var(--neu-success)',
      'General': 'var(--neu-text-muted)'
    };

    const maintenanceData = maintenanceGroups.map(g => ({
      name: g.category,
      tickets: g._count.id,
      color: colorMap[g.category] || 'var(--neu-text-muted)'
    }));

    res.json({
      kpis,
      revenueData,
      maintenanceData
    });

  } catch (err) {
    next(err);
  }
};

exports.getActivityFeed = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const formattedLogs = logs.map(log => ({
      id: log.id,
      user: log.user?.name || log.userId || 'System',
      action: log.action.replace(/_/g, ' '),
      entity: log.entity,
      time: log.timestamp
    }));

    res.json(formattedLogs);
  } catch (err) {
    next(err);
  }
};
