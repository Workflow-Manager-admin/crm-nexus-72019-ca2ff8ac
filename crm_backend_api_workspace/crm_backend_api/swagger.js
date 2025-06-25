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
      },
      {
        name: 'Interactions',
        description: 'Log and view customer interactions'
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
        },
        Interaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Unique interaction ID', example: 21 },
            customerId: { type: 'integer', description: 'Customer ID', example: 1 },
            userId: { type: 'integer', description: 'User ID who logged', example: 2 },
            type: { type: 'string', enum: ['call', 'meeting', 'email', 'note'], description: 'Interaction type', example: 'call' },
            summary: { type: 'string', nullable: true, description: 'Short summary of interaction', example: 'Follow-up meeting' },
            occurredAt: { type: 'string', format: 'date-time', description: 'When the interaction occurred', example: '2024-04-10T15:00:00Z' },
            createdAt: { type: 'string', format: 'date-time', description: 'When interaction was logged' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update' },
            Customer: {
              type: 'object',
              description: 'Linked Customer (optional, populated if included)',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Jane Doe' },
                email: { type: 'string', example: 'jane@example.com' }
              }
            },
            User: {
              type: 'object',
              description: 'User who logged interaction',
              properties: {
                id: { type: 'integer', example: 2 },
                username: { type: 'string', example: 'user123' },
                email: { type: 'string', example: 'user@example.com' }
              }
            }
          }
        },
        InteractionInput: {
          type: 'object',
          properties: {
            customerId: { type: 'integer', description: 'Customer ID this is logged for', example: 1 },
            type: { type: 'string', enum: ['call', 'meeting', 'email', 'note'], description: 'Type of interaction', example: 'call' },
            summary: { type: 'string', description: 'Summary/details', example: 'Phone call regarding demo' },
            occurredAt: { type: 'string', format: 'date-time', description: 'When it happened', example: '2024-04-10T15:00:00Z' }
          },
          required: ['customerId', 'type', 'occurredAt']
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
