require('dotenv').config();
const { Sequelize } = require('sequelize');

// PUBLIC_INTERFACE
/**
 * Initializes and exports the Sequelize instance for PostgreSQL,
 * and automatically registers all defined models.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'crm',
  process.env.DB_USER || 'crmuser',
  process.env.DB_PASSWORD || 'changeme',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  }
);

// Import models
const User = require('./user')(sequelize);
const Customer = require('./customer')(sequelize);
const Interaction = require('./interaction')(sequelize);
const Task = require('./task')(sequelize);

// Define model associations
User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

Customer.hasMany(Interaction, { foreignKey: 'customerId' });
Interaction.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(Task, { foreignKey: 'customerId' });
Task.belongsTo(Customer, { foreignKey: 'customerId' });

User.hasMany(Interaction, { foreignKey: 'userId' });
Interaction.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Customer,
  Interaction,
  Task,
};
