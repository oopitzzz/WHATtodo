const express = require('express');
const http = require('http');
const buildTrashRouter = require('.');

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
    getTrash: async (userId, options) => ({
      items: [
        { todo_id: 'deleted-todo-1', title: 'Deleted Todo 1', status: 'DELETED' },
        { todo_id: 'deleted-todo-2', title: 'Deleted Todo 2', status: 'DELETED' }
      ],
      meta: {
        page: options.page || 1,
        pageSize: options.pageSize || 20,
        total: 2,
        totalPages: 1
      }
    }),
    permanentlyDeleteTrash: async (userId, id) => {
      if (id === 'deleted-todo-1') {
        return true;
      }
      throw new Error('Trash item not found');
    }
  };

  const router = buildTrashRouter({
    authMiddleware: (req, _res, next) => {
      req.user = { userId: 'user-1', email: 'test@example.com' };
      next();
    },
    trashService: mockService,
  });

  const app = express();
  app.use(express.json());
  app.use('/api/trash', router);

  const server = app.listen(0);

  try {
    // Test 1: GET /api/trash - 휴지통 조회
    const listRes = await performRequest(server, {
      method: 'GET',
      path: '/api/trash?page=1&pageSize=20'
    });
    if (listRes.status !== 200 || !listRes.body.items || listRes.body.items.length !== 2) {
      throw new Error('GET /api/trash failed');
    }
    if (!listRes.body.meta || !listRes.body.meta.page || !listRes.body.meta.total) {
      throw new Error('GET /api/trash meta check failed');
    }

    // Test 2: DELETE /api/trash/:id - 영구 삭제
    const deleteRes = await performRequest(server, {
      method: 'DELETE',
      path: '/api/trash/deleted-todo-1'
    });
    if (deleteRes.status !== 204) {
      throw new Error('DELETE /api/trash/:id failed (expected 204)');
    }

    console.log('✅ trash routes tests passed');
    console.log('✅ All 2 endpoints verified (GET /api/trash with pagination, DELETE /api/trash/:id)');
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run();
