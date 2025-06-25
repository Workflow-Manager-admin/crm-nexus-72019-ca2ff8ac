const { Task, Interaction, Sequelize } = require('../models');

/**
 * MetricsService provides various counts, summaries,
 * and time-based aggregations for dashboard analytics.
 */
class MetricsService {
  // PUBLIC_INTERFACE
  /**
   * Get overall entity counts for dashboard summary.
   * @returns {Promise<object>} { customerCount, interactionCount, taskCount }
   */
  async getEntityCounts() {
    const [interactionCount, taskCount] = await Promise.all([
      Interaction.count(),
      Task.count()
    ]);
    // For extensibility, customerCount added if desired.
    // Skip for now (customer module not required for analytics).
    return { interactionCount, taskCount };
  }

  // PUBLIC_INTERFACE
  /**
   * Get aggregated counts of interactions per type for statistics pie charts.
   * @returns {Promise<Array<{type: string, count: number}>>}
   */
  async getInteractionTypeSummary() {
    const rows = await Interaction.findAll({
      attributes: [
        'type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });
    return rows.map(r => ({ type: r.type, count: parseInt(r.count, 10) }));
  }

  // PUBLIC_INTERFACE
  /**
   * Get aggregated counts of tasks per status for statistics pie charts.
   * @returns {Promise<Array<{status: string, count: number}>>}
   */
  async getTaskStatusSummary() {
    const rows = await Task.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    return rows.map(r => ({ status: r.status, count: parseInt(r.count, 10) }));
  }

  // PUBLIC_INTERFACE
  /**
   * Get count of interactions grouped by day for the last N days,
   * or between custom date ranges if provided.
   * @param {Object} params { days?: number, from?: string, to?: string }
   * @returns {Promise<Array<{date: string, count: number}>>}
   */
  async getInteractionsOverTime({ days = 30, from, to } = {}) {
    let where = {};
    const Op = Sequelize.Op;
    let groupBy = Sequelize.literal(`DATE("occurredAt")`);
    let dateRange = {};

    if (from || to) {
      if (from) dateRange[Op.gte] = new Date(from);
      if (to) dateRange[Op.lte] = new Date(to);
      where.occurredAt = dateRange;
    } else if (days > 0) {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - (days - 1));
      where.occurredAt = { [Op.gte]: cutoff };
    }

    const rows = await Interaction.findAll({
      attributes: [
        [Sequelize.literal(`DATE("occurredAt")`), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: [groupBy],
      order: [[Sequelize.literal('date'), 'ASC']],
      raw: true
    });

    // Format: {date: YYYY-MM-DD, count: N}
    return rows.map(r => ({
      date: r.date,
      count: parseInt(r.count, 10)
    }));
  }

  // PUBLIC_INTERFACE
  /**
   * Get count of tasks grouped by day for the last N days or custom range.
   * Counts based on createdAt date.
   * @param {Object} params { days?: number, from?: string, to?: string }
   * @returns {Promise<Array<{date: string, count: number}>>}
   */
  async getTasksOverTime({ days = 30, from, to } = {}) {
    let where = {};
    const Op = Sequelize.Op;
    let groupBy = Sequelize.literal(`DATE("createdAt")`);
    let dateRange = {};

    if (from || to) {
      if (from) dateRange[Op.gte] = new Date(from);
      if (to) dateRange[Op.lte] = new Date(to);
      where.createdAt = dateRange;
    } else if (days > 0) {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - (days - 1));
      where.createdAt = { [Op.gte]: cutoff };
    }

    const rows = await Task.findAll({
      attributes: [
        [Sequelize.literal(`DATE("createdAt")`), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where,
      group: [groupBy],
      order: [[Sequelize.literal('date'), 'ASC']],
      raw: true
    });

    return rows.map(r => ({
      date: r.date,
      count: parseInt(r.count, 10)
    }));
  }
}

module.exports = new MetricsService();

