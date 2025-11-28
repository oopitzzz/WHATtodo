const cors = require('cors');

const localOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

// Always allow localhost for local testing, and merge with env/prod hosts.
const allowedOrigins = [
  ...new Set([
    ...localOrigins,
    ...envOrigins,
    ...(process.env.NODE_ENV === 'production'
      ? [
          'https://whattodo.vercel.app',
          'https://jes4375.vercel.app',
          'https://jes4375fe.vercel.app',
          'https://backend-ten-ochre-86.vercel.app',
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
        ].filter(Boolean)
      : []),
  ]),
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without origin (like mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }
    // Allow whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // For production, be more permissive with vercel.app domains
    if (process.env.NODE_ENV === 'production' && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

module.exports = cors(corsOptions);
