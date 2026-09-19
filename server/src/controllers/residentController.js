const prisma = require('../utils/prisma');

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
    const { name, email, password, block, lot, moveInDate, status } = req.body;
    
    // In a real app, hash password here using bcrypt
    // But since this is a prototype, we can use a dummy plain text or simple hash
    
    // We create the user and resident in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: 'hashed_password_placeholder', // TODO: implement real hash
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
    
    res.status(201).json(result);
  } catch (err) {
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
    const { block, lot, status } = req.body;
    
    const resident = await prisma.resident.update({
      where: { id: req.params.id },
      data: { block, lot, status }
    });
    
    res.json(resident);
  } catch (err) {
    next(err);
  }
};
