const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'crm_jwt_dev_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '2d';

/**
 * AuthService handles user registration and login, password hashing, and JWT issuing.
 */
class AuthService {
  // PUBLIC_INTERFACE
  /**
   * Register a new user (hash password, persist user, return JWT).
   * @param {string} username - User's chosen username
   * @param {string} email - User's email address
   * @param {string} password - Plaintext password
   * @returns {Promise<{token: string}>}
   * @throws {object} {code: string, message: string}
   */
  async register(username, email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const existing = await User.findOne({
        where: { [User.sequelize.Op.or]: [{ email }, { username }] }
      });
      if (existing) {
        throw { code: 'DUPLICATE', message: 'User with this email or username already exists' };
      }
      const user = await User.create({
        username,
        email,
        passwordHash,
        role: 'user',
      });
      const token = this._generateJWT(user);
      return { token };
    } catch (err) {
      throw err;
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Login user (check email/password, issue JWT).
   * @param {string} email - User's email
   * @param {string} password - Plaintext password
   * @returns {Promise<string>} JWT token
   * @throws {object} {code: string, message: string}
   */
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }
    // Only include "id", "email", "username", "role" in JWT payload
    return this._generateJWT(user);
  }

  // PUBLIC_INTERFACE
  /**
   * Generate a JWT for the supplied user.
   * @param {object} user - The user instance from Sequelize
   * @returns {string} JWT token
   */
  _generateJWT(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Validate JWT token, returns decoded user or throws.
   * @param {string} token - JWT string
   * @returns {object} decoded token info
   * @throws {Error} if token is invalid or expired
   */
  verifyJWT(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = new AuthService();
