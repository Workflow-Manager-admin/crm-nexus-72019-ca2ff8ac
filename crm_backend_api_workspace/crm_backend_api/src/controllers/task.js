const taskService = require('../services/task');

/**
 * TaskController handles CRUD and filtering for customer-related tasks.
 * All endpoints require authentication.
 */
class TaskController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Create a new task for a customer
   *     description: Assign a new task to a user for a customer. Requires authentication.
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/TaskInput"
   *     responses:
   *       201:
   *         description: Task created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Task"
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
      const created = await taskService.createTask(input);
      return res.status(201).json(created);
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
   * /tasks/{id}:
   *   put:
   *     summary: Update a task
   *     description: Update fields/status/assignee for a specific task. Requires authentication.
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/TaskUpdateInput"
   *     responses:
   *       200:
   *         description: Task updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Task"
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
      const updated = await taskService.updateTask(id, input);
      if (!updated) {
        return res.status(404).json({ message: 'Task not found' });
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
   * /tasks:
   *   get:
   *     summary: List all tasks, optionally filtered
   *     description: List all tasks, filterable by status, customerId, userId, or due date range. Requires authentication.
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: customerId
   *         schema:
   *           type: integer
   *         description: Customer ID to filter by
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: User ID (assignee) to filter by
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [todo, in_progress, done, cancelled]
   *         description: Status to filter by
   *       - in: query
   *         name: dueDateFrom
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only show tasks due after this date (inclusive)
   *       - in: query
   *         name: dueDateTo
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Only show tasks due before this date (inclusive)
   *     responses:
   *       200:
   *         description: List of tasks
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: "#/components/schemas/Task"
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async list(req, res) {
    try {
      const { customerId, userId, status, dueDateFrom, dueDateTo } = req.query;
      const filter = {};
      if (customerId !== undefined) filter.customerId = customerId;
      if (userId !== undefined) filter.userId = userId;
      if (status !== undefined) filter.status = status;
      if (dueDateFrom !== undefined) filter.dueDateFrom = dueDateFrom;
      if (dueDateTo !== undefined) filter.dueDateTo = dueDateTo;
      const tasks = await taskService.listTasks(filter);
      return res.status(200).json(tasks);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /tasks/{id}:
   *   get:
   *     summary: Retrieve a single task
   *     description: Get details for a specific task by ID. Requires authentication.
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Task ID
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: "#/components/schemas/Task"
   *       404:
   *         description: Task not found
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async retrieve(req, res) {
    try {
      const id = req.params.id;
      const task = await taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.status(200).json(task);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     description: Delete a task by ID. Requires authentication.
   *     tags: [Tasks]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Task ID
   *     responses:
   *       204:
   *         description: Task successfully deleted
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Task not found
   *       500:
   *         description: Internal server error
   */
  async delete(req, res) {
    try {
      const deleted = await taskService.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new TaskController();
