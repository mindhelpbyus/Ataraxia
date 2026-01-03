/**
 * CORS Configuration for bedrockBackend Cloud Function
 * Add this to your Firebase Cloud Function
 */

const cors = require('cors');

/**
 * Get allowed origins from environment variables
 */
function getAllowedOrigins() {
  const origins = [
    process.env.CORS_ORIGIN || 'https://ataraxia-c150f.web.app'
  ];

  // Add additional origins if specified
  if (process.env.CORS_ADDITIONAL_ORIGINS) {
    const additionalOrigins = process.env.CORS_ADDITIONAL_ORIGINS.split(',');
    origins.push(...additionalOrigins);
  }

  // Add localhost for development
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                        process.env.ENABLE_TEST_LOGIN === 'true';
  
  if (isDevelopment) {
    origins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    );
  }

  return origins;
}

/**
 * Create CORS middleware
 */
function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();

  console.log('CORS Configuration:', {
    environment: process.env.NODE_ENV,
    allowedOrigins: allowedOrigins
  });

  return cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight for 10 minutes
  });
}

module.exports = {
  getAllowedOrigins,
  createCorsMiddleware
};
