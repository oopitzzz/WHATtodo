const assert = require('assert');
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

async function testCreateTodo() {
  const mock = new MockPool();
  mock.response = { rows: [{ todo_id: 'todo-1', title: 'Test' }] };
  todoRepository.__setPool(mock);

  const todo = await todoRepository.createTodo({
    userId: 'user-1',
    title: 'Test Todo',
    description: 'desc',
  });

  assert.strictEqual(todo.todo_id, 'todo-1');
  assert(mock.calls[0].text.includes('INSERT INTO todos'), 'should insert into todos table');
  assert.strictEqual(mock.calls[0].params[0], 'user-1');
}

async function testFindTodosFilterAndSort() {
  const mock = new MockPool();
  mock.response = { rows: [] };
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
  assert(call.text.includes('status ='), 'should filter by status');
  assert(call.text.includes('priority ='), 'should filter by priority');
  assert(call.text.includes('ILIKE'), 'should include search clause');
  assert(call.text.includes('deleted_at IS NULL'), 'should ignore deleted todos by default');
  assert(call.text.includes('ORDER BY priority DESC'), 'should sort by priority desc');
  assert.strictEqual(call.params[0], 'user-1');
  assert.strictEqual(call.params[call.params.length - 2], 5);
  assert.strictEqual(call.params[call.params.length - 1], 10);
}

async function testUpdateTodoQuery() {
  const mock = new MockPool();
  mock.response = { rows: [{ todo_id: 'todo-1', title: 'Updated' }] };
  todoRepository.__setPool(mock);

  const updated = await todoRepository.updateTodo('todo-1', 'user-1', {
    title: 'Updated',
    priority: 'HIGH',
  });

  assert.strictEqual(updated.todo_id, 'todo-1');
  const call = mock.calls[0];
  assert(call.text.includes('SET title ='), 'should update title');
  assert(call.text.includes('priority ='), 'should update priority');
  assert.strictEqual(call.params[0], 'Updated');
  assert.strictEqual(call.params[1], 'HIGH');
}

async function testPermanentDeleteRestriction() {
  const mock = new MockPool();
  mock.response = { rows: [{ todo_id: 'todo-1' }] };
  todoRepository.__setPool(mock);

  const deleted = await todoRepository.permanentlyDeleteTodo('todo-1', 'user-1');
  assert.strictEqual(deleted, true);

  const call = mock.calls[0];
  assert(call.text.includes("INTERVAL '30 days'"), 'should enforce 30-day restriction');
  assert.deepStrictEqual(call.params, ['todo-1', 'user-1']);
}

async function run() {
  try {
    await testCreateTodo();
    await testFindTodosFilterAndSort();
    await testUpdateTodoQuery();
    await testPermanentDeleteRestriction();
    console.log('todo repository tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    todoRepository.__resetPool();
  }
}

run();
