const { DataTypes } = require('sequelize');

// PUBLIC_INTERFACE
/**
 * Returns the Customer model for the CRM system.
 * Fields: id, name, email, phone, company, notes, createdAt, updatedAt.
 */
module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: true,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    company: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'customers',
    timestamps: true
  });

  return Customer;
};
