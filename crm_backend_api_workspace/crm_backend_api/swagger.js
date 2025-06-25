const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM Express API',
      version: '1.0.0',
      description: 'CRM API documented with Swagger.\n\n**Authentication:**\n- Register at `/auth/register` or login at `/auth/login` to obtain a JWT.\n- Use the "Authorize" button above and paste your token (without quotes) as: `Bearer {your_token}`.\n- All endpoints (except `/auth/*` and `/`) are protected by default and require Authorization header.\n\n',
    },
    tags: [
      {
        name: 'Auth',
        description: 'User authentication'
      },
      {
        name: 'Health',
        description: 'Health check endpoints'
      }
      // Other tags (Customers, Tasks, Interactions) may be added as features expand
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
