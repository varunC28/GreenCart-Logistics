export const openApiDoc = {
  openapi: '3.0.0',
  info: { title: 'GreenCart Logistics API', version: '1.0.0' },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Drivers' },
    { name: 'Routes' },
    { name: 'Orders' },
    { name: 'Simulation' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string' }, password: { type: 'string' } },
      },
      LoginResponse: {
        type: 'object',
        properties: { token: { type: 'string' } },
      },
      Driver: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          currentShiftHours: { type: 'integer' },
          past7DayHours: { type: 'array', items: { type: 'integer' } },
        },
      },
      DriverCreate: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          currentShiftHours: { type: 'integer' },
          past7DayHours: { type: 'array', items: { type: 'integer' } },
        },
      },
      Route: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          routeId: { type: 'string' },
          distanceKm: { type: 'number' },
          trafficLevel: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          baseTimeMinutes: { type: 'integer' },
        },
      },
      RouteCreate: {
        type: 'object',
        required: ['routeId', 'distanceKm', 'trafficLevel', 'baseTimeMinutes'],
        properties: {
          routeId: { type: 'string' },
          distanceKm: { type: 'number' },
          trafficLevel: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          baseTimeMinutes: { type: 'integer' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          orderId: { type: 'string' },
          valueRs: { type: 'integer' },
          assignedRouteId: { type: 'integer', nullable: true },
          deliveryTimestamp: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      OrderCreate: {
        type: 'object',
        required: ['orderId', 'valueRs'],
        properties: {
          orderId: { type: 'string' },
          valueRs: { type: 'integer' },
          assignedRouteId: { type: 'integer', nullable: true },
          deliveryTimestamp: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      SimInput: {
        type: 'object',
        required: ['numDrivers', 'routeStartTime', 'maxHoursPerDriver'],
        properties: {
          numDrivers: { type: 'integer' },
          routeStartTime: { type: 'string', example: '09:00' },
          maxHoursPerDriver: { type: 'integer' },
        },
      },
      Kpis: {
        type: 'object',
        properties: {
          totalProfit: { type: 'integer' },
          efficiencyScore: { type: 'integer' },
          onTimeDeliveries: { type: 'integer' },
          lateDeliveries: { type: 'integer' },
          fuel: {
            type: 'object',
            properties: { base: { type: 'integer' }, surcharge: { type: 'integer' } },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login to receive JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { email: 'admin@greencart.local', password: 'admin123' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
                example: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
          '400': { description: 'Invalid payload' },
        },
      },
    },
    '/drivers': {
      get: {
        tags: ['Drivers'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Driver' } },
                example: [{ id: 1, name: 'Aisha', currentShiftHours: 2, past7DayHours: [8,7,6,5,4,3,2] }],
              },
            },
          },
        },
      },
      post: {
        tags: ['Drivers'],
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/DriverCreate' }, example: { name: 'Rahul', currentShiftHours: 0 } } } },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Driver' } } } } },
      },
    },
    '/drivers/{id}': {
      get: { tags: ['Drivers'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      put: { tags: ['Drivers'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Drivers'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } },
    },
    '/routes': {
      get: { tags: ['Routes'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Routes'], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RouteCreate' }, example: { routeId: 'R-101', distanceKm: 12.3, trafficLevel: 'High', baseTimeMinutes: 48 } } } }, responses: { '201': { description: 'Created' } } },
    },
    '/routes/{id}': {
      get: { tags: ['Routes'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      put: { tags: ['Routes'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Routes'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } },
    },
    '/orders': {
      get: { tags: ['Orders'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Orders'], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderCreate' }, example: { orderId: 'O-5001', valueRs: 900, assignedRouteId: 1 } } } }, responses: { '201': { description: 'Created' } } },
    },
    '/orders/{id}': {
      get: { tags: ['Orders'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      put: { tags: ['Orders'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
      delete: { tags: ['Orders'], security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true }], responses: { '204': { description: 'No Content' }, '404': { description: 'Not Found' } } },
    },
    '/simulate': {
      post: {
        tags: ['Simulation'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SimInput' },
              example: { numDrivers: 3, routeStartTime: '09:00', maxHoursPerDriver: 8 },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Kpis' },
                example: { totalProfit: 12345, efficiencyScore: 78, onTimeDeliveries: 8, lateDeliveries: 2, fuel: { base: 500, surcharge: 120 }, simulationId: 10 },
              },
            },
          },
          '400': { description: 'Bad Request' },
        },
      },
    },
    '/simulate/history': {
      get: {
        tags: ['Simulation'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } },
                example: [
                  { id: 10, createdAt: '2025-08-10T10:00:00Z', inputs: { numDrivers: 3, routeStartTime: '09:00', maxHoursPerDriver: 8 }, metrics: { totalProfit: 12345, efficiencyScore: 78, onTimeDeliveries: 8, lateDeliveries: 2 } },
                ],
              },
            },
          },
        },
      },
    },
  },
} as const;


