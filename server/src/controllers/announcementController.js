const prisma = require('../utils/prisma');
const { createAnnouncementSchema } = require('../validators/announcementValidator');

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
    const parsed = createAnnouncementSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message, details: parsed.error.errors });
    }
    const { title, body, category, pinned } = parsed.data;
    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        category,
        pinned: pinned || false,
        createdBy: req.user?.name || 'Admin User'
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
