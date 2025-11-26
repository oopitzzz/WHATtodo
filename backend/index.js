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

// Auth endpoints
const signupHandler = require('./auth/signup');
const loginHandler = require('./auth/login');
const logoutHandler = require('./auth/logout');
const refreshHandler = require('./auth/refresh');
const createTodoRouter = require('./todos');

app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/logout', logoutHandler);
app.post('/api/auth/refresh', refreshHandler);

const todoRouter = createTodoRouter();
app.use('/api/todos', todoRouter);

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
