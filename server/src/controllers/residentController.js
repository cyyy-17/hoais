const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { createResidentSchema, updateResidentSchema } = require('../validators/residentValidator');
const auditService = require('../services/auditService');

// Get all residents
exports.getAllResidents = async (req, res, next) => {
  try {
    const residents = await prisma.resident.findMany({
      include: {
        user: { select: { name: true, email: true } },
        households: true,
      },
    });
    res.json(residents);
  } catch (err) {
    next(err);
  }
};

// Create a resident
exports.createResident = async (req, res, next) => {
  try {
    const parsed = createResidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    
    const { name, email, password, block, lot, moveInDate, status } = parsed.data;
    
    // Hash password here using bcrypt
    const hashedPassword = bcrypt.hashSync(password || 'password123', 12);
    
    // We create the user and resident in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'RESIDENT'
        }
      });
      
      const resident = await tx.resident.create({
        data: {
          userId: user.id,
          block,
          lot,
          moveInDate: new Date(moveInDate),
          status: status || 'ACTIVE'
        }
      });
      
      return { user, resident };
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'CREATE_RESIDENT', 'RESIDENT', result.resident.id);

    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(err);
  }
};

// Get single resident
exports.getResident = async (req, res, next) => {
  try {
    const resident = await prisma.resident.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        households: true,
        dues: true,
        maintenance: true
      },
    });
    
    if (!resident) return res.status(404).json({ error: 'Resident not found' });
    res.json(resident);
  } catch (err) {
    next(err);
  }
};

// Update resident
exports.updateResident = async (req, res, next) => {
  try {
    const parsed = updateResidentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    
    const { block, lot, status } = parsed.data;
    
    const resident = await prisma.resident.update({
      where: { id: req.params.id },
      data: { block, lot, status }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'UPDATE_RESIDENT', 'RESIDENT', resident.id);

    res.json(resident);
  } catch (err) {
    next(err);
  }
};
