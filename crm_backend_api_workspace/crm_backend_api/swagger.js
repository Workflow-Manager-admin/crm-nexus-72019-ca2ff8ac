const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM Express API',
      version: '1.0.0',
      description: 'CRM API documented with Swagger. Includes JWT authentication for protected endpoints.',
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
