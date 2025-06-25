const express = require('express');
const healthController = require('../controllers/health');
const authController = require('../controllers/auth');
const customerController = require('../controllers/customer');
const { authenticateJWT } = require('../middleware');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication
 *   - name: Customers
 *     description: Manage customer records
 */

const router = express.Router();

// Auth endpoints
router.post('/auth/register', authController.register.bind(authController));
router.post('/auth/login', authController.login.bind(authController));

// Customer CRUD endpoints (all protected)
router.post('/customers', authenticateJWT, customerController.create.bind(customerController));
router.get('/customers', authenticateJWT, customerController.list.bind(customerController));
router.get('/customers/:id', authenticateJWT, customerController.retrieve.bind(customerController));
router.put('/customers/:id', authenticateJWT, customerController.update.bind(customerController));
router.delete('/customers/:id', authenticateJWT, customerController.delete.bind(customerController));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

module.exports = router;
