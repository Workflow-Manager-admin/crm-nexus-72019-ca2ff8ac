// This file will export middleware as the application grows
const authenticateJWT = require('./auth');
module.exports = {
  authenticateJWT,
};
