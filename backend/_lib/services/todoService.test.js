const todoService = require('./todoService');

const buildMockRepo = (overrides = {}) => ({
  createTodo: jest.fn().mockImplementation(async (payload) => ({ todo_id: 'todo-1', ...payload })),
  findTodosByUserId: jest.fn().mockResolvedValue([]),
  findTodoById: jest.fn().mockResolvedValue({ todo_id: 'todo-1', user_id: 'user-1' }),
  updateTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', title: 'updated' }),
  completeTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'COMPLETED' }),
  deleteTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'DELETED' }),
  restoreTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'ACTIVE' }),
  permanentlyDeleteTodo: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('todoService', () => {
  afterEach(() => {
    todoService.__setRepository(null);
    jest.clearAllMocks();
  });

  it('should validate title required on create', async () => {
    todoService.__setRepository(buildMockRepo());
    await expect(todoService.createTodo('user-1', { title: '   ' })).rejects.toMatchObject({
      code: 'VALIDATION_TITLE_REQUIRED',
      statusCode: 400,
    });
  });

  it('should create todo with trimmed title', async () => {
    const repo = buildMockRepo();
    todoService.__setRepository(repo);

    const todo = await todoService.createTodo('user-1', {
      title: '  My Todo ',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });

    expect(repo.createTodo).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Todo' })
    );
    expect(todo.title).toBe('My Todo');
  });

  it('should throw when todo not found in getTodoById', async () => {
    const repo = buildMockRepo({ findTodoById: jest.fn().mockResolvedValue(null) });
    todoService.__setRepository(repo);

    await expect(todoService.getTodoById('user-1', 'todo-404')).rejects.toMatchObject({
      code: 'TODO_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('should update todo with validation', async () => {
    const repo = buildMockRepo({
      updateTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', title: 'new' }),
    });
    todoService.__setRepository(repo);

    const updated = await todoService.updateTodo('user-1', 'todo-1', { title: ' new ' });
    expect(repo.updateTodo).toHaveBeenCalled();
    expect(updated.title).toBe('new');
  });

  it('should throw on complete conflict', async () => {
    const repo = buildMockRepo({ completeTodo: jest.fn().mockResolvedValue(null) });
    todoService.__setRepository(repo);

    await expect(todoService.completeTodo('user-1', 'todo-1')).rejects.toMatchObject({
      code: 'TODO_ALREADY_COMPLETED',
      statusCode: 409,
    });
  });

  it('should restore todo', async () => {
    const repo = buildMockRepo({
      restoreTodo: jest.fn().mockResolvedValue({ todo_id: 'todo-1', status: 'ACTIVE' }),
    });
    todoService.__setRepository(repo);

    const restored = await todoService.restoreTodo('user-1', 'todo-1', 'ACTIVE');
    expect(repo.restoreTodo).toHaveBeenCalledWith('todo-1', 'user-1', 'ACTIVE');
    expect(restored.status).toBe('ACTIVE');
  });

  it('should enforce 30-day restriction on permanent delete', async () => {
    const repo = buildMockRepo({ permanentlyDeleteTodo: jest.fn().mockResolvedValue(false) });
    todoService.__setRepository(repo);

    await expect(todoService.permanentlyDeleteTodo('user-1', 'todo-1')).rejects.toMatchObject({
      code: 'TODO_PERMANENT_NOT_ALLOWED',
      statusCode: 404,
    });
  });
});
