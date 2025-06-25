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
      },
      {
        name: 'Customers',
        description: 'Manage customer records'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Customer ID', example: 1 },
            name: { type: 'string', description: 'Full name', example: 'Jane Doe' },
            email: { type: 'string', nullable: true, description: 'Email address', example: 'jane@example.com' },
            phone: { type: 'string', nullable: true, description: 'Phone number', example: '+1-555-1234' },
            company: { type: 'string', nullable: true, description: 'Company', example: 'Umbrella Corp' },
            notes: { type: 'string', nullable: true, description: 'Notes about the customer', example: 'Biggest client.' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last updated timestamp' },
          }
        },
        CustomerInput: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Full name', example: 'Jane Doe' },
            email: { type: 'string', nullable: true, description: 'Email address', example: 'jane@example.com' },
            phone: { type: 'string', nullable: true, description: 'Phone number', example: '+1-555-1234' },
            company: { type: 'string', nullable: true, description: 'Company', example: 'Umbrella Corp' },
            notes: { type: 'string', nullable: true, description: 'Notes about the customer', example: 'Biggest client.' },
          },
          required: ['name']
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
