const customerService = require('../services/customer');

/**
 * CustomerController handles CRUD operations for Customer resources.
 *
 * All endpoints require authentication.
 */
class CustomerController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers:
   *   post:
   *     summary: Create a new customer
   *     description: Add a new customer record. Requires authentication.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CustomerInput"
   *     responses:
   *       201:
   *         description: Customer created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Customer"
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async create(req, res) {
    try {
      const input = req.body;
      const customer = await customerService.createCustomer(input);
      return res.status(201).json(customer);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers:
   *   get:
   *     summary: List all customers
   *     description: Retrieve a list of all customers. Requires authentication.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Customer"
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async list(req, res) {
    try {
      const customers = await customerService.getCustomers();
      return res.status(200).json(customers);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers/{id}:
   *   get:
   *     summary: Get customer by ID
   *     description: Retrieve a single customer by its ID. Requires authentication.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Customer ID
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Customer"
   *       404:
   *         description: Customer not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async retrieve(req, res) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      return res.status(200).json(customer);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers/{id}:
   *   put:
   *     summary: Update a customer
   *     description: Update a customer record. Requires authentication.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Customer ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/CustomerInput"
   *     responses:
   *       200:
   *         description: Customer updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Customer"
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Not found
   *       500:
   *         description: Internal server error
   */
  async update(req, res) {
    try {
      const id = req.params.id;
      const input = req.body;
      const updated = await customerService.updateCustomer(id, input);
      if (!updated) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      return res.status(200).json(updated);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /customers/{id}:
   *   delete:
   *     summary: Delete a customer
   *     description: Delete a customer record by ID. Requires authentication.
   *     tags: [Customers]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Customer ID
   *     responses:
   *       204:
   *         description: Customer successfully deleted
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Customer not found
   *       500:
   *         description: Internal server error
   */
  async delete(req, res) {
    try {
      const deleted = await customerService.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new CustomerController();

