const { Customer } = require('../models');

/**
 * Utility to serialize a list of customers to CSV.
 * Header: id,name,email,phone,company,notes,createdAt,updatedAt
 * All fields are quoted if not null, EOL is \n.
 */
function customersToCsv(customers) {
  const header = [
    'id', 'name', 'email', 'phone', 'company', 'notes', 'createdAt', 'updatedAt'
  ];
  const rows = [header.join(',')];

  for (const cust of customers) {
    const vals = header.map((field) => {
      // Escape quotes and any newlines in the field value
      let val = cust[field] !== null && cust[field] !== undefined ? String(cust[field]) : '';
      val = val.replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${val}"`;
    });
    rows.push(vals.join(','));
  }
  return rows.join('\n');
}

// PUBLIC_INTERFACE
/**
 * Fetches customers filtered by query object, returns as plain objects.
 * Accepts optional filters: name, email, company, createdAtFrom, createdAtTo.
 * @param {object} filter
 * @returns {Promise<object[]>}
 */
async function getCustomersForCsv(filter = {}) {
  const where = {};
  if (filter.name) where.name = filter.name;
  if (filter.email) where.email = filter.email;
  if (filter.company) where.company = filter.company;
  if (filter.createdAtFrom || filter.createdAtTo) {
    where.createdAt = {};
    if (filter.createdAtFrom) where.createdAt['$gte'] = filter.createdAtFrom;
    if (filter.createdAtTo) where.createdAt['$lte'] = filter.createdAtTo;
  }
  const result = await Customer.findAll({
    where,
    order: [['createdAt', 'DESC']],
    raw: true
  });
  return result;
}

module.exports = {
  customersToCsv,
  getCustomersForCsv
};
