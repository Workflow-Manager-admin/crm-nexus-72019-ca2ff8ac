const { Customer } = require('../models');

/**
 * Utility to perform basic validation of customer input.
 * Throws { code: 'VALIDATION_ERROR', message: string } if invalid.
 * @param {object} data
 * @param {boolean} requireName
 */
function validateCustomerInput(data, requireName = true) {
  if (requireName && (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0)) {
    throw { code: 'VALIDATION_ERROR', message: 'Customer name is required' };
  }
  if (data.email && (typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email))) {
    throw { code: 'VALIDATION_ERROR', message: 'Email must be a valid email address' };
  }
  if (data.phone && typeof data.phone !== 'string') {
    throw { code: 'VALIDATION_ERROR', message: 'Phone must be a string' };
  }
  if (data.company && typeof data.company !== 'string') {
    throw { code: 'VALIDATION_ERROR', message: 'Company must be a string' };
  }
  if (data.notes && typeof data.notes !== 'string') {
    throw { code: 'VALIDATION_ERROR', message: 'Notes must be a string' };
  }
}

// PUBLIC_INTERFACE
/**
 * Create a customer record.
 * @param {object} data
 * @returns {Promise<Customer>}
 */
async function createCustomer(data) {
  validateCustomerInput(data);
  const created = await Customer.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    notes: data.notes,
  });
  return created;
}

// PUBLIC_INTERFACE
/**
 * List all customers.
 * @returns {Promise<Customer[]>}
 */
async function getCustomers() {
  const customers = await Customer.findAll({ order: [['createdAt', 'DESC']] });
  return customers;
}

// PUBLIC_INTERFACE
/**
 * Get a customer by ID.
 * @param {string|number} id
 * @returns {Promise<Customer|null>}
 */
async function getCustomerById(id) {
  return await Customer.findByPk(id);
}

// PUBLIC_INTERFACE
/**
 * Update customer record by ID.
 * @param {string|number} id
 * @param {object} data
 * @returns {Promise<Customer|null>} updated object or null if not found
 */
async function updateCustomer(id, data) {
  validateCustomerInput(data, false);
  const customer = await Customer.findByPk(id);
  if (!customer) return null;
  // Only update allowed props
  const allowed = ['name', 'email', 'phone', 'company', 'notes'];
  allowed.forEach((k) => {
    if (data[k] !== undefined) customer[k] = data[k];
  });
  await customer.save();
  return customer;
}

// PUBLIC_INTERFACE
/**
 * Delete a customer by ID.
 * @param {string|number} id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteCustomer(id) {
  const customer = await Customer.findByPk(id);
  if (!customer) return false;
  await customer.destroy();
  return true;
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};

