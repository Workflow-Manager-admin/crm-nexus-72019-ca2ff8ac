const authService = require('../services/auth');

/**
 * Authentication controller for registering users and logging in.
 */
class AuthController {
  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     description: |
   *       Registers a new user account. Responds with a JWT for authentication on success.
   *       The JWT must be used in the Authorization header (see `BearerAuth` security scheme).
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [username, email, password]
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User created and JWT returned
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       400:
   *         description: Bad request (validation or duplicate user)
   *       500:
   *         description: Internal server error
   */
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      const result = await authService.register(username, email, password);
      return res.status(201).json({ token: result.token });
    } catch (err) {
      if (err.code === 'DUPLICATE') {
        return res.status(400).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user and receive JWT
   *     description: |
   *       Authenticate using email and password. Responds with a JWT for further requests.
   *       The JWT must be included in the Authorization header for protected endpoints.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful, JWT returned
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Internal server error
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const token = await authService.login(email, password);
      return res.status(200).json({ token });
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ message: err.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();
