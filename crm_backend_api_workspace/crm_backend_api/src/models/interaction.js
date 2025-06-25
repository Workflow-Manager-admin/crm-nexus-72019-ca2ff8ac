const { DataTypes } = require('sequelize');

// PUBLIC_INTERFACE
/**
 * Returns the Interaction model representing emails, calls, meetings, etc.
 * Fields: id, customerId, userId, type, summary, occurredAt, createdAt.
 */
module.exports = (sequelize) => {
  const Interaction = sequelize.define('Interaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'customers', key: 'id' },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    type: {
      type: DataTypes.ENUM('call', 'meeting', 'email', 'note'),
      allowNull: false
    },
    summary: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    occurredAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'interactions',
    timestamps: true
  });

  return Interaction;
};
