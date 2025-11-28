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
    ...(process.env.NODE_ENV === 'production' ? ['https://whattodo.vercel.app'] : []),
  ]),
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
