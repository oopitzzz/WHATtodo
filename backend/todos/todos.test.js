const express = require('express');
const request = require('supertest');
const buildTodoRouter = require('./index');

describe('todo routes', () => {
  let app;
  let mockService;

  beforeEach(() => {
    mockService = {
      getTodos: jest.fn().mockResolvedValue([{ todo_id: 'todo-1' }]),
      createTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', title: 'Test' }),
      getTodoById: jest.fn().mockResolvedValue({ todo_id: 'todo-1' }),
      updateTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', title: 'Updated' }),
      completeTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'COMPLETED' }),
      restoreTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'ACTIVE' }),
      deleteTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'DELETED' }),
    };

    const router = buildTodoRouter({
      authMiddleware: (req, _res, next) => {
        req.user = { userId: 'user-1', email: 'test@example.com' };
        next();
      },
      todoService: mockService,
    });

    app = express();
    app.use(express.json());
    app.use('/api/todos', router);
  });

  it('should list todos', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockService.getTodos).toHaveBeenCalledWith('user-1', expect.any(Object));
  });

  it('should create todo', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test');
    expect(mockService.createTodo).toHaveBeenCalledWith('user-1', { title: 'Test' });
  });
});
