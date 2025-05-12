export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Conference Management API',
    version: '1.0.0',
    description: 'API for managing conferences and registrations'
  },
  paths: {
    '/api/conferences': {
      get: {
        summary: 'List all conferences',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 }
          },
          {
            name: 'pageSize',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['startDate', 'name', 'location'] }
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] }
          }
        ],
        responses: {
          '200': {
            description: 'List of conferences',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedConferences' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new conference',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConference' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Conference created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Conference' }
              }
            }
          }
        }
      }
    },
    '/api/conferences/search': {
      get: {
        summary: 'Search conferences',
        parameters: [
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' }
          },
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' }
          },
          {
            name: 'location',
            in: 'query',
            schema: { type: 'string' }
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number', minimum: 0 }
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number', minimum: 0 }
          }
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Conference' }
                }
              }
            }
          }
        }
      }
    },
    '/api/registrations': {
      post: {
        summary: 'Create a new registration',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRegistration' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registration created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Registration' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Conference: {
        type: 'object',
        required: ['id', 'name', 'startDate', 'endDate', 'location', 'price'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          maxAttendees: { type: 'integer', minimum: 1 },
          currentAttendees: { type: 'integer', minimum: 0 },
          price: { type: 'number', minimum: 0 },
          status: { 
            type: 'string',
            enum: ['draft', 'published', 'cancelled']
          }
        }
      },
      Registration: {
        type: 'object',
        required: ['id', 'conferenceId', 'userId', 'attendeeInfo', 'amount'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          conferenceId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled']
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'refunded']
          },
          amount: { type: 'number', minimum: 0 },
          attendeeInfo: { $ref: '#/components/schemas/AttendeeInfo' }
        }
      },
      AttendeeInfo: {
        type: 'object',
        required: ['name', 'email', 'phone', 'organization'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          organization: { type: 'string' }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
};