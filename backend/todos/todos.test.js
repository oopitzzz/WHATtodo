const express = require('express');
const http = require('http');
const buildTodoRouter = require('.');

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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null,
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  const mockService = {
    getTodos: async () => [{ todo_id: 'todo-1' }],
    createTodo: async () => ({ todo_id: 'todo-1', title: 'Test' }),
    getTodoById: async () => ({ todo_id: 'todo-1' }),
    updateTodo: async () => ({ todo_id: 'todo-1', title: 'Updated' }),
    completeTodo: async () => ({ todo_id: 'todo-1', status: 'COMPLETED' }),
    restoreTodo: async () => ({ todo_id: 'todo-1', status: 'ACTIVE' }),
    deleteTodo: async () => ({ todo_id: 'todo-1', status: 'DELETED' }),
  };

  const router = buildTodoRouter({
    authMiddleware: (req, _res, next) => {
      req.user = { userId: 'user-1', email: 'test@example.com' };
      next();
    },
    todoService: mockService,
  });

  const app = express();
  app.use(express.json());
  app.use('/api/todos', router);

  const server = app.listen(0);

  try {
    const listRes = await performRequest(server, { method: 'GET', path: '/api/todos' });
    if (listRes.status !== 200 || listRes.body.data.length !== 1) {
      throw new Error('GET /api/todos failed');
    }

    const createRes = await performRequest(
      server,
      { method: 'POST', path: '/api/todos', headers: { 'Content-Type': 'application/json' } },
      { title: 'Test' }
    );
    if (createRes.status !== 201 || createRes.body.data.title !== 'Test') {
      throw new Error('POST /api/todos failed');
    }

    console.log('todo routes tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run();
