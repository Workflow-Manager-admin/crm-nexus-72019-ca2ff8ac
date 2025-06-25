const { Interaction, Customer, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Validate input for interaction creation/update.
 * Throws { code: 'VALIDATION_ERROR', message: string } if invalid.
 * @param {object} data
 * @param {boolean} requireAll
 */
function validateInteractionInput(data, requireAll = true) {
  if (requireAll) {
    if (!data.customerId || isNaN(Number(data.customerId))) {
      throw { code: 'VALIDATION_ERROR', message: 'customerId is required and must be a valid ID' };
    }
    if (!data.type || !['call', 'meeting', 'email', 'note'].includes(data.type)) {
      throw { code: 'VALIDATION_ERROR', message: 'Type must be one of: call, meeting, email, note' };
    }
    if (!data.occurredAt || isNaN(Date.parse(data.occurredAt))) {
      throw { code: 'VALIDATION_ERROR', message: 'occurredAt (ISO date string) is required' };
    }
  }
  if (data.summary && typeof data.summary !== 'string') {
    throw { code: 'VALIDATION_ERROR', message: 'Summary must be a string' };
  }
}

/**
 * PUBLIC_INTERFACE
 * Create a new interaction and link to customer and user
 * @param {object} data
 * @param {object} user
 * @returns {Promise<Interaction>}
 */
async function createInteraction(data, user) {
  validateInteractionInput(data, true);
  // check customer exists
  const customer = await Customer.findByPk(data.customerId);
  if (!customer) {
    throw { code: 'VALIDATION_ERROR', message: 'Customer does not exist' };
  }
  // Only log for existing user
  const dbUser = await User.findByPk(user.id);
  if (!dbUser) {
    throw { code: 'VALIDATION_ERROR', message: 'User not found' };
  }
  const interaction = await Interaction.create({
    customerId: data.customerId,
    userId: user.id,
    type: data.type,
    summary: data.summary,
    occurredAt: new Date(data.occurredAt)
  });
  return interaction;
}

/**
 * PUBLIC_INTERFACE
 * List interactions, with optional filter:
 * - customerId
 * - type (call/meeting/email/note)
 * - date range: occurredAtFrom (inclusive), occurredAtTo (inclusive)
 * - userId (show only my interactions)
 * Returns most recent first.
 */
async function listInteractions(filter = {}) {
  const where = {};
  if (filter.customerId) {
    where.customerId = filter.customerId;
  }
  if (filter.type) {
    where.type = filter.type;
  }
  if (filter.userId) {
    where.userId = filter.userId;
  }
  if (filter.occurredAtFrom || filter.occurredAtTo) {
    where.occurredAt = {};
    if (filter.occurredAtFrom) {
      where.occurredAt[Op.gte] = new Date(filter.occurredAtFrom);
    }
    if (filter.occurredAtTo) {
      where.occurredAt[Op.lte] = new Date(filter.occurredAtTo);
    }
  }
  const interactions = await Interaction.findAll({
    where,
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: User, attributes: ['id', 'username', 'email'] }
    ],
    order: [['occurredAt', 'DESC'], ['createdAt', 'DESC']]
  });
  return interactions;
}

/**
 * PUBLIC_INTERFACE
 * Retrieve a single interaction by id (protected).
 * @param {integer} id
 * @returns {Promise<Interaction>}
 */
async function getInteractionById(id) {
  return Interaction.findByPk(id, {
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: User, attributes: ['id', 'username', 'email'] }
    ]
  });
}

module.exports = {
  createInteraction,
  listInteractions,
  getInteractionById
};
