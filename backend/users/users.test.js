const express = require('express');
const http = require('http');
const buildUsersRouter = require('.');

async function performRequest(server, options, body) {
  const { port } = server.address();
  const requestOptions = {
    hostname: '127.0.0.1',
    port,
    path: options.path,
    method: options.method,
    headers: options.headers || {},
  };

  return new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const mockService = {
    getProfile: async () => ({ user_id: 'user-1', email: 'test@example.com', nickname: 'Tester' }),
    updateProfile: async () => ({ user_id: 'user-1', email: 'test@example.com', nickname: 'Updated' })
  };

  const router = buildUsersRouter({
    authMiddleware: (req, _res, next) => {
      req.user = { userId: 'user-1', email: 'test@example.com' };
      next();
    },
    userService: mockService,
  });

  const app = express();
  app.use(express.json());
  app.use('/api/users', router);
  const server = app.listen(0);

  try {
    const getRes = await performRequest(server, { method: 'GET', path: '/api/users/me' });
    if (getRes.status !== 200 || !getRes.body.data) throw new Error('GET /api/users/me failed');

    const putRes = await performRequest(server, { method: 'PUT', path: '/api/users/me', headers: { 'Content-Type': 'application/json' } }, { nickname: 'Updated' });
    if (putRes.status !== 200 || !putRes.body.data) throw new Error('PUT /api/users/me failed');

    console.log('✅ users routes tests passed');
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run();
