const { getCustomersForCsv, customersToCsv } = require('../services/customerCsv');

/**
 * Controller for exporting customer data as CSV.
 */
class CustomerCsvController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers/export/csv:
   *   get:
   *     summary: Export customers as CSV
   *     description: |
   *       Downloads a CSV of customers. Only authenticated users can access this endpoint.
   *       Optional query parameters can filter which customers are exported.
   *       Columns: id, name, email, phone, company, notes, createdAt, updatedAt.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: name
   *         schema: { type: string }
   *         description: Filter by customer name (exact match)
   *       - in: query
   *         name: email
   *         schema: { type: string }
   *         description: Filter by email (exact match)
   *       - in: query
   *         name: company
   *         schema: { type: string }
   *         description: Filter by company (exact match)
   *       - in: query
   *         name: createdAtFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only include customers created after this ISO date
   *       - in: query
   *         name: createdAtTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only include customers created before this ISO date
   *     responses:
   *       200:
   *         description: CSV file of customers
   *         content:
   *           text/csv:
   *             schema:
   *               type: string
   *               format: binary
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async exportCsv(req, res) {
    try {
      const filter = {};
      if (req.query.name) filter.name = req.query.name;
      if (req.query.email) filter.email = req.query.email;
      if (req.query.company) filter.company = req.query.company;
      if (req.query.createdAtFrom) filter.createdAtFrom = req.query.createdAtFrom;
      if (req.query.createdAtTo) filter.createdAtTo = req.query.createdAtTo;
      const customers = await getCustomersForCsv(filter);

      const csvString = customersToCsv(customers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
      return res.status(200).send(csvString);
    } catch (err) {
      console.error('[CustomerCsvController] CSV export error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new CustomerCsvController();
