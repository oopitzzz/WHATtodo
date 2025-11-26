require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./_lib/middleware/cors');
const loggerMiddleware = require('./_lib/middleware/logger');
const errorHandler = require('./_lib/middleware/errorHandler');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use(loggerMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Example route to demonstrate error handler wiring
app.get('/error-check', (_req, res, next) => {
  const error = new Error('Intentional error');
  error.statusCode = 500;
  next(error);
});

app.use(errorHandler);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
}

module.exports = app;
