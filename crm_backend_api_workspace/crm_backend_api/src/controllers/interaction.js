const interactionService = require('../services/interaction');

/**
 * InteractionController handles CRUD and filtering for customer interactions.
 * All endpoints require authentication.
 */
class InteractionController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /interactions:
   *   post:
   *     summary: Log a new customer interaction
   *     description: Log an interaction (call, meeting, email, note) for a customer. Requires authentication.
   *     tags: [Interactions]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/InteractionInput"
   *     responses:
   *       201:
   *         description: Interaction created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Interaction"
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
      const user = req.user;
      const result = await interactionService.createInteraction(input, user);
      return res.status(201).json(result);
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
   * /interactions:
   *   get:
   *     summary: List all interactions (optionally filterable)
   *     description: List logged interactions. Filter by customer, type, user, or occurredAt date range. Requires authentication.
   *     tags: [Interactions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: customerId
   *         schema:
   *           type: integer
   *         required: false
   *         description: Customer ID to filter by
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [call, meeting, email, note]
   *         description: Interaction type to filter by
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: User ID (creator) to filter by
   *       - in: query
   *         name: occurredAtFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only show interactions occurred after this date (inclusive)
   *       - in: query
   *         name: occurredAtTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only show interactions occurred before this date (inclusive)
   *     responses:
   *       200:
   *         description: List of interactions returned
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Interaction"
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async list(req, res) {
    try {
      const { customerId, type, occurredAtFrom, occurredAtTo, userId } = req.query;
      const filter = {};
      if (customerId !== undefined) filter.customerId = customerId;
      if (type !== undefined) filter.type = type;
      if (userId !== undefined) filter.userId = userId;
      if (occurredAtFrom !== undefined) filter.occurredAtFrom = occurredAtFrom;
      if (occurredAtTo !== undefined) filter.occurredAtTo = occurredAtTo;
      const interactions = await interactionService.listInteractions(filter);
      return res.status(200).json(interactions);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /interactions/{id}:
   *   get:
   *     summary: Retrieve a single interaction
   *     description: Get details for a specific interaction by ID. Requires authentication.
   *     tags: [Interactions]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Interaction ID
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Interaction"
   *       404:
   *         description: Not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async retrieve(req, res) {
    try {
      const id = req.params.id;
      const interaction = await interactionService.getInteractionById(id);
      if (!interaction) {
        return res.status(404).json({ message: 'Interaction not found' });
      }
      return res.status(200).json(interaction);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new InteractionController();
