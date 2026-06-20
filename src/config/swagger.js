/**
 * Swagger Documentation Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./environment');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YogaFlow API',
      version: '1.0.0',
      description: 'API Documentation for the YogaFlow AI-powered backend.',
      contact: {
        name: 'YogaFlow Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development Server',
      },
      {
        url: 'https://yogaflow.onrender.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Firebase ID Token
          description: 'Enter your Firebase ID token as a Bearer token',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.model.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
