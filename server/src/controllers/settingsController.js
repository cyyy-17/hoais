const prisma = require('../utils/prisma');
const auditService = require('../services/auditService');

// Get HOA Profile
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await prisma.hoaProfile.findFirst();
    if (!profile) {
      // Create a default one if none exists
      profile = await prisma.hoaProfile.create({
        data: {
          name: 'Your Homeowners Association',
          address: '123 Main St, City, Country',
          email: 'admin@hoa.com',
          phone: '+1 234 567 8900'
        }
      });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// Update HOA Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, address, email, phone } = req.body;
    let profile = await prisma.hoaProfile.findFirst();
    if (profile) {
      profile = await prisma.hoaProfile.update({
        where: { id: profile.id },
        data: { name, address, email, phone }
      });
    } else {
      profile = await prisma.hoaProfile.create({
        data: { name, address, email, phone }
      });
    }
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'UPDATE_PROFILE', 'HOA_PROFILE', profile.id);
    
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

// Get all Board Members
exports.getBoardMembers = async (req, res, next) => {
  try {
    const members = await prisma.boardMember.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(members);
  } catch (err) {
    next(err);
  }
};

// Add Board Member
exports.addBoardMember = async (req, res, next) => {
  try {
    const { name, role, email } = req.body;
    const member = await prisma.boardMember.create({
      data: { name, role, email }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'ADD_BOARD_MEMBER', 'BOARD_MEMBER', member.id);
    
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

// Update Board Member
exports.updateBoardMember = async (req, res, next) => {
  try {
    const { name, role, email } = req.body;
    const member = await prisma.boardMember.update({
      where: { id: req.params.id },
      data: { name, role, email }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'UPDATE_BOARD_MEMBER', 'BOARD_MEMBER', member.id);
    
    res.json(member);
  } catch (err) {
    next(err);
  }
};

// Remove Board Member
exports.removeBoardMember = async (req, res, next) => {
  try {
    const memberId = req.params.id;
    await prisma.boardMember.delete({
      where: { id: memberId }
    });
    
    await auditService.logAction(req.user?.id || 'SYSTEM', 'REMOVE_BOARD_MEMBER', 'BOARD_MEMBER', memberId);
    
    res.json({ message: 'Board member removed' });
  } catch (err) {
    next(err);
  }
};
