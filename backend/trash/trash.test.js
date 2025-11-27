const express = require('express');
const request = require('supertest');
const buildTrashRouter = require('.');

describe('trash routes', () => {
  let app;
  let mockService;

  beforeEach(() => {
    mockService = {
      getTrash: jest.fn().mockResolvedValue({
        items: [
          { todo_id: 'deleted-todo-1', title: 'Deleted Todo 1', status: 'DELETED' },
          { todo_id: 'deleted-todo-2', title: 'Deleted Todo 2', status: 'DELETED' },
        ],
        meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      }),
      permanentlyDeleteTrash: jest.fn().mockResolvedValue(true),
    };

    const router = buildTrashRouter({
      authMiddleware: (req, _res, next) => {
        req.user = { userId: 'user-1', email: 'test@example.com' };
        next();
      },
      trashService: mockService,
    });

    app = express();
    app.use(express.json());
    app.use('/api/trash', router);
  });

  it('should list trash items', async () => {
    const res = await request(app).get('/api/trash?page=1&pageSize=20');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(mockService.getTrash).toHaveBeenCalledWith('user-1', { page: '1', pageSize: '20' });
  });

  it('should delete trash item permanently', async () => {
    const res = await request(app).delete('/api/trash/deleted-todo-1');
    expect(res.status).toBe(204);
    expect(mockService.permanentlyDeleteTrash).toHaveBeenCalledWith('user-1', 'deleted-todo-1');
  });
});
