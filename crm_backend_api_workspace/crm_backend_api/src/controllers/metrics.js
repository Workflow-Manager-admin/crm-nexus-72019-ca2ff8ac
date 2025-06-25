const metricsService = require('../services/metrics');

/**
 * MetricsController provides endpoints for dashboard analytics,
 * including entity counts, summaries, and timeseries aggregations.
 */
class MetricsController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /metrics/summary:
   *   get:
   *     summary: Overview entity counts for dashboard
   *     description: Returns overall counts of interactions and tasks.
   *     tags: [Metrics]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Entity counts summary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 interactionCount:
   *                   type: integer
   *                 taskCount:
   *                   type: integer
   */
  async summary(req, res) {
    try {
      const counts = await metricsService.getEntityCounts();
      res.status(200).json(counts);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /metrics/interactionTypeSummary:
   *   get:
   *     summary: Count of interactions by type
   *     description: Returns the number of interactions grouped by type (call, meeting, email, note).
   *     tags: [Metrics]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Counts by type
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   type: { type: string }
   *                   count: { type: integer }
   */
  async interactionTypeSummary(req, res) {
    try {
      const summary = await metricsService.getInteractionTypeSummary();
      res.status(200).json(summary);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /metrics/taskStatusSummary:
   *   get:
   *     summary: Count of tasks by status
   *     description: Returns the number of tasks grouped by status (todo, in_progress, done, cancelled).
   *     tags: [Metrics]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Task counts by status
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   status: { type: string }
   *                   count: { type: integer }
   */
  async taskStatusSummary(req, res) {
    try {
      const summary = await metricsService.getTaskStatusSummary();
      res.status(200).json(summary);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /metrics/interactionsOverTime:
   *   get:
   *     summary: Interactions count per day (time series)
   *     description: For dashboard chart, returns daily counts of logged interactions for the last N days or given date range ('from', 'to' query: ISO 8601 string).
   *     tags: [Metrics]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema: { type: integer }
   *         description: Days back to include. Ignored if 'from'/'to' provided. Default 30.
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *         description: Start date (YYYY-MM-DD, ISO 8601)
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *         description: End date (YYYY-MM-DD, ISO 8601)
   *     responses:
   *       200:
   *         description: List of {date, count}
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   date: { type: string, format: date }
   *                   count: { type: integer }
   */
  async interactionsOverTime(req, res) {
    try {
      const params = {
        days: req.query.days ? parseInt(req.query.days, 10) : undefined,
        from: req.query.from,
        to: req.query.to
      };
      const series = await metricsService.getInteractionsOverTime(params);
      res.status(200).json(series);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /metrics/tasksOverTime:
   *   get:
   *     summary: Tasks created per day (time series)
   *     description: For dashboard chart, returns daily counts of tasks created in the last N days or given date range ('from', 'to').
   *     tags: [Metrics]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         schema: { type: integer }
   *         description: Days back to include. Ignored if 'from'/'to' provided. Default 30.
   *       - in: query
   *         name: from
   *         schema: { type: string, format: date }
   *         description: Start date (YYYY-MM-DD, ISO 8601)
   *       - in: query
   *         name: to
   *         schema: { type: string, format: date }
   *         description: End date (YYYY-MM-DD, ISO 8601)
   *     responses:
   *       200:
   *         description: List of {date, count}
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   date: { type: string, format: date }
   *                   count: { type: integer }
   */
  async tasksOverTime(req, res) {
    try {
      const params = {
        days: req.query.days ? parseInt(req.query.days, 10) : undefined,
        from: req.query.from,
        to: req.query.to
      };
      const series = await metricsService.getTasksOverTime(params);
      res.status(200).json(series);
    } catch (err) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new MetricsController();
