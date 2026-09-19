const prisma = require('../utils/prisma');
const { createDueSchema, recordPaymentSchema } = require('../validators/duesValidator');
const auditService = require('../services/auditService');

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
    const parsed = createDueSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { residentId, amount, period, dueDate } = parsed.data;
    
    const dues = await prisma.dues.create({
      data: {
        residentId,
        amount,
        period,
        dueDate: new Date(dueDate),
        status: 'PENDING'
      }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'CREATE_DUES_RECORD', 'DUES', dues.id);
    
    res.status(201).json(dues);
  } catch (err) {
    next(err);
  }
};

// Record a payment
exports.recordPayment = async (req, res, next) => {
  try {
    const parsed = recordPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { duesId, amount, method, referenceNo } = parsed.data;
    
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
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'RECORD_PAYMENT', 'PAYMENT', result.id);
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
