const { Task, Customer, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Validate input for task creation/update.
 * Throws { code: 'VALIDATION_ERROR', message: string } if invalid.
 * @param {object} data
 * @param {boolean} requireAll
 */
function validateTaskInput(data, requireAll = true) {
  if (requireAll) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0)
      throw { code: 'VALIDATION_ERROR', message: 'Task title is required' };
    if (!data.dueDate || isNaN(Date.parse(data.dueDate)))
      throw { code: 'VALIDATION_ERROR', message: 'dueDate (ISO string) is required' };
    if (!data.status ||
      !['todo', 'in_progress', 'done', 'cancelled'].includes(data.status)) {
      throw { code: 'VALIDATION_ERROR', message: 'Invalid status' };
    }
    if (!data.userId || isNaN(Number(data.userId)))
      throw { code: 'VALIDATION_ERROR', message: 'userId is required' };
    if (!data.customerId || isNaN(Number(data.customerId)))
      throw { code: 'VALIDATION_ERROR', message: 'customerId is required' };
  }
  if (data.description && typeof data.description !== 'string')
    throw { code: 'VALIDATION_ERROR', message: 'Description must be a string' };
}

// PUBLIC_INTERFACE
/**
 * Create a new task for a customer and assign to a user
 * @param {object} data
 * @returns {Promise<Task>}
 */
async function createTask(data) {
  validateTaskInput(data, true);

  // check customer & user
  const customer = await Customer.findByPk(data.customerId);
  if (!customer) throw { code: 'VALIDATION_ERROR', message: 'Customer does not exist' };
  const user = await User.findByPk(data.userId);
  if (!user) throw { code: 'VALIDATION_ERROR', message: 'User does not exist' };

  const created = await Task.create({
    title: data.title,
    description: data.description,
    dueDate: new Date(data.dueDate),
    status: data.status || 'todo',
    userId: data.userId,
    customerId: data.customerId
  });
  return created;
}

// PUBLIC_INTERFACE
/**
 * Update a task by ID.
 * @param {number} id
 * @param {object} data (partial update)
 * @returns {Promise<Task|null>}
 */
async function updateTask(id, data) {
  const task = await Task.findByPk(id);
  if (!task) return null;

  // Partial validation only on provided fields
  if (data.title !== undefined && (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0))
    throw { code: 'VALIDATION_ERROR', message: 'title must be a nonempty string' };
  if (data.status !== undefined &&
    !['todo', 'in_progress', 'done', 'cancelled'].includes(data.status))
    throw { code: 'VALIDATION_ERROR', message: 'Invalid status' };
  if (data.dueDate !== undefined && isNaN(Date.parse(data.dueDate)))
    throw { code: 'VALIDATION_ERROR', message: 'dueDate must be valid ISO8601 string' };
  if (data.userId !== undefined && isNaN(Number(data.userId)))
    throw { code: 'VALIDATION_ERROR', message: 'userId must be an integer' };
  if (data.customerId !== undefined && isNaN(Number(data.customerId)))
    throw { code: 'VALIDATION_ERROR', message: 'customerId must be an integer' };
  if (data.userId !== undefined) {
    const user = await User.findByPk(data.userId);
    if (!user) throw { code: 'VALIDATION_ERROR', message: 'userId not found' };
  }
  if (data.customerId !== undefined) {
    const customer = await Customer.findByPk(data.customerId);
    if (!customer) throw { code: 'VALIDATION_ERROR', message: 'customerId not found' };
  }
  if (data.description !== undefined && typeof data.description !== 'string')
    throw { code: 'VALIDATION_ERROR', message: 'Description must be a string' };

  // Only allowed fields
  const allowed = ['title', 'description', 'dueDate', 'status', 'userId', 'customerId'];
  allowed.forEach((k) => {
    if (data[k] !== undefined) task[k] = data[k];
  });

  await task.save();
  return task;
}

// PUBLIC_INTERFACE
/**
 * Get a single task by id.
 * @param {number} id
 * @returns {Promise<Task|null>}
 */
async function getTaskById(id) {
  return Task.findByPk(id, {
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: User, attributes: ['id', 'username', 'email'] }
    ]
  });
}

// PUBLIC_INTERFACE
/**
 * List tasks, filterable by: status, due date range, customerId, userId.
 * @param {object} filter
 */
async function listTasks(filter = {}) {
  const where = {};
  if (filter.customerId) where.customerId = filter.customerId;
  if (filter.userId) where.userId = filter.userId;
  if (filter.status) where.status = filter.status;
  if (filter.dueDateFrom || filter.dueDateTo) {
    where.dueDate = {};
    if (filter.dueDateFrom)
      where.dueDate[Op.gte] = new Date(filter.dueDateFrom);
    if (filter.dueDateTo)
      where.dueDate[Op.lte] = new Date(filter.dueDateTo);
  }
  const tasks = await Task.findAll({
    where,
    include: [
      { model: Customer, attributes: ['id', 'name', 'email'] },
      { model: User, attributes: ['id', 'username', 'email'] }
    ],
    order: [['dueDate', 'ASC'], ['createdAt', 'DESC']]
  });
  return tasks;
}

// PUBLIC_INTERFACE
/**
 * Delete a task by id.
 * @param {number} id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteTask(id) {
  const task = await Task.findByPk(id);
  if (!task) return false;
  await task.destroy();
  return true;
}

module.exports = {
  createTask,
  updateTask,
  getTaskById,
  listTasks,
  deleteTask,
};
