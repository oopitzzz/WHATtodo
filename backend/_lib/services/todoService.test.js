const assert = require('assert');
const todoService = require('./todoService');

function createMockRepo(overrides = {}) {
  return {
    createTodo: async () => ({ todo_id: 'todo-1' }),
    findTodosByUserId: async () => [],
    findTodoById: async () => ({ todo_id: 'todo-1', user_id: 'user-1' }),
    updateTodo: async () => ({ todo_id: 'todo-1', title: 'updated' }),
    completeTodo: async () => ({ todo_id: 'todo-1', status: 'COMPLETED' }),
    deleteTodo: async () => ({ todo_id: 'todo-1', status: 'DELETED' }),
    restoreTodo: async () => ({ todo_id: 'todo-1', status: 'ACTIVE' }),
    permanentlyDeleteTodo: async () => true,
    ...overrides,
  };
}

async function testCreateTodoValidation() {
  todoService.__setRepository(createMockRepo());
  let error = null;
  try {
    await todoService.createTodo('user-1', { title: '   ' });
  } catch (err) {
    error = err;
  }
  assert(error);
  assert.strictEqual(error.code, 'VALIDATION_TITLE_REQUIRED');
}

async function testCreateTodoSuccess() {
  let called = false;
  todoService.__setRepository(
    createMockRepo({
      createTodo: async (payload) => {
        called = true;
        return payload;
      },
    })
  );

  const todo = await todoService.createTodo('user-1', {
    title: '  My Todo ',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  });
  assert(called, 'createTodo should be called');
  assert.strictEqual(todo.title, 'My Todo');
}

async function testGetTodoByIdNotFound() {
  todoService.__setRepository(
    createMockRepo({
      findTodoById: async () => null,
    })
  );
  let error = null;
  try {
    await todoService.getTodoById('user-1', 'todo-404');
  } catch (err) {
    error = err;
  }
  assert(error);
  assert.strictEqual(error.code, 'TODO_NOT_FOUND');
}

async function testUpdateTodoSuccess() {
  let updateCalled = false;
  todoService.__setRepository(
    createMockRepo({
      updateTodo: async () => {
        updateCalled = true;
        return { todo_id: 'todo-1', title: 'new' };
      },
    })
  );

  const updated = await todoService.updateTodo('user-1', 'todo-1', { title: ' new ' });
  assert(updateCalled);
  assert.strictEqual(updated.title, 'new');
}

async function testCompleteTodoConflict() {
  todoService.__setRepository(
    createMockRepo({
      completeTodo: async () => null,
    })
  );
  let error = null;
  try {
    await todoService.completeTodo('user-1', 'todo-1');
  } catch (err) {
    error = err;
  }
  assert(error);
  assert.strictEqual(error.code, 'TODO_ALREADY_COMPLETED');
}

async function testRestoreTodo() {
  let restoreCalled = false;
  todoService.__setRepository(
    createMockRepo({
      restoreTodo: async () => {
        restoreCalled = true;
        return { todo_id: 'todo-1', status: 'ACTIVE' };
      },
    })
  );

  const restored = await todoService.restoreTodo('user-1', 'todo-1');
  assert(restoreCalled);
  assert.strictEqual(restored.status, 'ACTIVE');
}

async function testPermanentlyDeleteRestriction() {
  todoService.__setRepository(
    createMockRepo({
      permanentlyDeleteTodo: async () => false,
    })
  );
  let error = null;
  try {
    await todoService.permanentlyDeleteTodo('user-1', 'todo-1');
  } catch (err) {
    error = err;
  }
  assert(error);
  assert.strictEqual(error.code, 'TODO_PERMANENT_NOT_ALLOWED');
}

async function run() {
  try {
    await testCreateTodoValidation();
    await testCreateTodoSuccess();
    await testGetTodoByIdNotFound();
    await testUpdateTodoSuccess();
    await testCompleteTodoConflict();
    await testRestoreTodo();
    await testPermanentlyDeleteRestriction();
    console.log('todo service tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    todoService.__setRepository(null);
  }
}

run();
