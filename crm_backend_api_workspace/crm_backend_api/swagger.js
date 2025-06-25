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
        description: 'Manage customer records. Also supports CSV export at /customers/export/csv.'
      },
      {
        name: 'Interactions',
        description: 'Log and view customer interactions'
      },
      {
        name: 'Tasks',
        description: 'Assign and track tasks for customers'
      },
      {
        name: 'Metrics',
        description: 'Analytics/metrics endpoints for dashboard charts and statistics'
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
        // --- CSV Export Endpoint: /customers/export/csv ---
        CustomersCsvExportQuery: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Filter by customer name (exact match)' },
            email: { type: 'string', description: 'Filter by email (exact match)' },
            company: { type: 'string', description: 'Filter by company (exact match)' },
            createdAtFrom: { type: 'string', format: 'date-time', description: 'Created after date' },
            createdAtTo: { type: 'string', format: 'date-time', description: 'Created before date' }
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
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Task ID', example: 42 },
            title: { type: 'string', description: 'Title', example: 'Follow up call' },
            description: { type: 'string', nullable: true, description: 'Task details', example: 'Contact customer to discuss renewal.' },
            dueDate: { type: 'string', format: 'date-time', description: 'Task due date', example: '2024-12-01T17:00:00Z' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'Task status', example: 'todo' },
            userId: { type: 'integer', description: 'Assignee user ID', example: 2 },
            customerId: { type: 'integer', description: 'Linked customer ID', example: 1 },
            createdAt: { type: 'string', format: 'date-time', description: 'Created' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Updated' },
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
              description: 'Assigned user (assignee)',
              properties: {
                id: { type: 'integer', example: 2 },
                username: { type: 'string', example: 'user123' },
                email: { type: 'string', example: 'user@example.com' }
              }
            }
          }
        },
        TaskInput: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title', example: 'Arrange demo' },
            description: { type: 'string', description: 'Task details', example: 'Call to schedule demo' },
            dueDate: { type: 'string', format: 'date-time', description: 'Due date', example: '2024-12-01T17:00:00Z' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'Task status', example: 'todo' },
            userId: { type: 'integer', description: 'User ID assigned', example: 2 },
            customerId: { type: 'integer', description: 'ID of customer', example: 1 },
          },
          required: ['title', 'dueDate', 'status', 'userId', 'customerId']
        },
        TaskUpdateInput: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title', example: 'Prepare contract' },
            description: { type: 'string', description: 'Task details', example: 'Draft draft contract with legal.' },
            dueDate: { type: 'string', format: 'date-time', description: 'Due date', example: '2024-12-15T12:00:00Z' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'], description: 'Task status', example: 'in_progress' },
            userId: { type: 'integer', description: 'Assignee', example: 2 },
            customerId: { type: 'integer', description: 'ID of linked customer', example: 1 },
          }
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
