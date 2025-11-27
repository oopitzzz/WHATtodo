const todoRepository = require('./todoRepository');

class MockPool {
  constructor() {
    this.calls = [];
    this.response = { rows: [] };
  }

  async query(text, params) {
    this.calls.push({ text, params });
    return this.response;
  }
}

describe('todoRepository', () => {
  afterEach(() => {
    todoRepository.__resetPool();
  });

  it('should create todo', async () => {
    const mock = new MockPool();
    mock.response = { rows: [{ todo_id: 'todo-1', title: 'Test' }] };
    todoRepository.__setPool(mock);

    const todo = await todoRepository.createTodo({
      userId: 'user-1',
      title: 'Test Todo',
      description: 'desc',
    });

    expect(todo.todo_id).toBe('todo-1');
    expect(mock.calls[0].text).toContain('INSERT INTO todos');
    expect(mock.calls[0].params[0]).toBe('user-1');
  });

  it('should build filters and sort options', async () => {
    const mock = new MockPool();
    todoRepository.__setPool(mock);

    await todoRepository.findTodosByUserId('user-1', {
      status: 'ACTIVE',
      priority: 'HIGH',
      search: 'meeting',
      sortBy: 'priority',
      sortDirection: 'desc',
      limit: 5,
      offset: 10,
    });

    const call = mock.calls[0];
    expect(call.text).toContain('status =');
    expect(call.text).toContain('priority =');
    expect(call.text).toContain('ILIKE');
    expect(call.text).toContain('deleted_at IS NULL');
    expect(call.text).toContain('ORDER BY priority DESC');
    expect(call.params[0]).toBe('user-1');
    expect(call.params[call.params.length - 2]).toBe(5);
    expect(call.params[call.params.length - 1]).toBe(10);
  });

  it('should update todo fields', async () => {
    const mock = new MockPool();
    mock.response = { rows: [{ todo_id: 'todo-1', title: 'Updated' }] };
    todoRepository.__setPool(mock);

    const updated = await todoRepository.updateTodo('todo-1', 'user-1', {
      title: 'Updated',
      priority: 'HIGH',
    });

    const call = mock.calls[0];
    expect(call.text).toContain('SET title =');
    expect(call.text).toContain('priority =');
    expect(call.params[0]).toBe('Updated');
    expect(call.params[1]).toBe('HIGH');
    expect(updated.todo_id).toBe('todo-1');
  });

  it('should enforce 30-day condition on permanent delete', async () => {
    const mock = new MockPool();
    mock.response = { rows: [{ todo_id: 'todo-1' }] };
    todoRepository.__setPool(mock);

    const deleted = await todoRepository.permanentlyDeleteTodo('todo-1', 'user-1');
    expect(deleted).toBe(true);
    expect(mock.calls[0].text).toContain("INTERVAL '30 days'");
    expect(mock.calls[0].params).toEqual(['todo-1', 'user-1']);
  });
});
