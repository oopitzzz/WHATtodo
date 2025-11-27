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
    // Test 1: GET /api/todos - 목록 조회
    const listRes = await performRequest(server, { method: 'GET', path: '/api/todos' });
    if (listRes.status !== 200 || listRes.body.data.length !== 1) {
      throw new Error('GET /api/todos failed');
    }

    // Test 2: POST /api/todos - 생성
    const createRes = await performRequest(
      server,
      { method: 'POST', path: '/api/todos', headers: { 'Content-Type': 'application/json' } },
      { title: 'Test' }
    );
    if (createRes.status !== 201 || createRes.body.data.title !== 'Test') {
      throw new Error('POST /api/todos failed');
    }

    // Test 3: GET /api/todos/:id - 상세 조회
    const getRes = await performRequest(server, { method: 'GET', path: '/api/todos/todo-1' });
    if (getRes.status !== 200 || getRes.body.data.todo_id !== 'todo-1') {
      throw new Error('GET /api/todos/:id failed');
    }

    // Test 4: PUT /api/todos/:id - 수정
    const updateRes = await performRequest(
      server,
      { method: 'PUT', path: '/api/todos/todo-1', headers: { 'Content-Type': 'application/json' } },
      { title: 'Updated Title' }
    );
    if (updateRes.status !== 200 || updateRes.body.data.title !== 'Updated') {
      throw new Error('PUT /api/todos/:id failed');
    }

    // Test 5: PATCH /api/todos/:id/complete - 완료 처리
    const completeRes = await performRequest(
      server,
      { method: 'PATCH', path: '/api/todos/todo-1/complete' }
    );
    if (completeRes.status !== 200 || completeRes.body.data.status !== 'COMPLETED') {
      throw new Error('PATCH /api/todos/:id/complete failed');
    }

    // Test 6: PATCH /api/todos/:id/restore - 복원
    const restoreRes = await performRequest(
      server,
      { method: 'PATCH', path: '/api/todos/todo-1/restore', headers: { 'Content-Type': 'application/json' } },
      { status: 'ACTIVE' }
    );
    if (restoreRes.status !== 200 || restoreRes.body.data.status !== 'ACTIVE') {
      throw new Error('PATCH /api/todos/:id/restore failed');
    }

    // Test 7: DELETE /api/todos/:id - 삭제
    const deleteRes = await performRequest(server, { method: 'DELETE', path: '/api/todos/todo-1' });
    if (deleteRes.status !== 200 || deleteRes.body.data.status !== 'DELETED') {
      throw new Error('DELETE /api/todos/:id failed');
    }

    console.log('✅ todo routes tests passed');
    console.log('✅ All 7 endpoints verified (GET, POST, GET:id, PUT, PATCH complete, PATCH restore, DELETE)');
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run();
