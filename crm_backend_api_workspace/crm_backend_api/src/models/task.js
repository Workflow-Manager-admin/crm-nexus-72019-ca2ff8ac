const { DataTypes } = require('sequelize');

// PUBLIC_INTERFACE
/**
 * Returns the Task model for assigning and tracking CRM tasks.
 * Fields: id, title, description, dueDate, status, userId, customerId, createdAt, updatedAt.
 */
module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'due_date'
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done', 'cancelled'),
      allowNull: false,
      defaultValue: 'todo'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'customers', key: 'id' }
    }
  }, {
    tableName: 'tasks',
    timestamps: true
  });

  return Task;
};
