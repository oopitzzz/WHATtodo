const cors = require('cors');

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://whattodo.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

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
