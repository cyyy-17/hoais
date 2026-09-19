const { z } = require('zod');

exports.createAnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  pinned: z.boolean().optional(),
});
