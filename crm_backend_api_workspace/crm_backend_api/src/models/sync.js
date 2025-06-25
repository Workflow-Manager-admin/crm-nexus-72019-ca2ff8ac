require('dotenv').config();
const { sequelize } = require('./index');

/**
 * Run this script with `node src/models/sync.js` to create DB tables according to Sequelize models definitions.
 * WARNING: In development, it uses `sync({ alter: true })`, which alters tables to current models. In production, use migrations.
 */
async function main() {
  try {
    await sequelize.authenticate();
    // WARNING: alter is safe for dev, for prod use real migrations!
    await sequelize.sync({ alter: true });
    console.log('Database schema created/updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Database sync failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
