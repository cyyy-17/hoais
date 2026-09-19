const prisma = require('../utils/prisma');

exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, category, pinned } = req.body;
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        category,
        pinned: pinned || false,
        createdBy: 'Admin User' // In reality, get from req.user
      }
    });
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
