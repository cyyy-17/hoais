const prisma = require('../utils/prisma');

// Get all dues
exports.getAllDues = async (req, res, next) => {
  try {
    const dues = await prisma.dues.findMany({
      include: {
        resident: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        payments: true
      },
    });
    res.json(dues);
  } catch (err) {
    next(err);
  }
};

// Create new dues record
exports.createDues = async (req, res, next) => {
  try {
    const { residentId, amount, period, dueDate } = req.body;
    const dues = await prisma.dues.create({
      data: {
        residentId,
        amount,
        period,
        dueDate: new Date(dueDate),
        status: 'PENDING'
      }
    });
    res.status(201).json(dues);
  } catch (err) {
    next(err);
  }
};

// Record a payment
exports.recordPayment = async (req, res, next) => {
  try {
    const { duesId, amount, method, referenceNo } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { duesId, amount, method, referenceNo }
      });
      
      // Check if fully paid
      const dues = await tx.dues.findUnique({ 
        where: { id: duesId },
        include: { payments: true }
      });
      
      const totalPaid = dues.payments.reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid >= dues.amount) {
        await tx.dues.update({
          where: { id: duesId },
          data: { status: 'PAID' }
        });
      }
      
      return payment;
    });
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
