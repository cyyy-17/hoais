const prisma = require('../utils/prisma');

/**
 * Log an action to the audit trail
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Describe the action (e.g. 'CREATE_RESIDENT')
 * @param {string} entity - The entity being affected (e.g. 'RESIDENT')
 * @param {string} entityId - The ID of the affected entity
 */
exports.logAction = async (userId, action, entity, entityId) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
