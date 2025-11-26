let todoRepository = require('../repositories/todoRepository');

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validateTitle(title) {
  if (title === undefined) return undefined;
  const trimmed = title.trim();
  if (!trimmed) {
    throw createError('할일 제목은 필수입니다', 400, 'VALIDATION_TITLE_REQUIRED');
  }
  if (trimmed.length > 100) {
    throw createError('할일 제목은 100자 이하여야 합니다', 400, 'VALIDATION_TITLE_LENGTH');
  }
  return trimmed;
}

function validateDueDate(dueDate) {
  if (!dueDate) return null;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    throw createError('유효하지 않은 마감일입니다', 400, 'VALIDATION_DUE_DATE_INVALID');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  if (parsed < today) {
    throw createError('마감일은 과거일 수 없습니다', 400, 'VALIDATION_DUE_DATE_PAST');
  }
  return parsed.toISOString().split('T')[0];
}

async function createTodo(userId, data) {
  const title = validateTitle(data.title);
  const dueDate = validateDueDate(data.dueDate);

  return todoRepository.createTodo({
    userId,
    title,
    description: data.description ?? null,
    priority: data.priority ?? 'NORMAL',
    status: data.status ?? 'ACTIVE',
    dueDate,
    memo: data.memo ?? null,
  });
}

async function getTodos(userId, filters) {
  return todoRepository.findTodosByUserId(userId, filters);
}

async function getTodoById(userId, todoId) {
  const todo = await todoRepository.findTodoById(todoId, userId);
  if (!todo) {
    throw createError('할일을 찾을 수 없습니다', 404, 'TODO_NOT_FOUND');
  }
  return todo;
}

async function updateTodo(userId, todoId, updates = {}) {
  if (updates.title !== undefined) {
    updates.title = validateTitle(updates.title);
  }
  if (updates.dueDate !== undefined) {
    updates.dueDate = validateDueDate(updates.dueDate);
  }

  await getTodoById(userId, todoId);

  const updated = await todoRepository.updateTodo(todoId, userId, updates);
  if (!updated) {
    throw createError('할일 수정에 실패했습니다', 500, 'TODO_UPDATE_FAILED');
  }
  return updated;
}

async function completeTodo(userId, todoId) {
  const completed = await todoRepository.completeTodo(todoId, userId);
  if (!completed) {
    throw createError('이미 완료되었거나 삭제된 할일입니다', 409, 'TODO_ALREADY_COMPLETED');
  }
  return completed;
}

async function deleteTodo(userId, todoId) {
  const deleted = await todoRepository.deleteTodo(todoId, userId);
  if (!deleted) {
    throw createError('할일을 찾을 수 없습니다', 404, 'TODO_NOT_FOUND');
  }
  return deleted;
}

async function restoreTodo(userId, todoId, status = 'ACTIVE') {
  const restored = await todoRepository.restoreTodo(todoId, userId, status);
  if (!restored) {
    throw createError('복원할 할일을 찾을 수 없습니다', 404, 'TODO_NOT_FOUND');
  }
  return restored;
}

async function permanentlyDeleteTodo(userId, todoId) {
  const deleted = await todoRepository.permanentlyDeleteTodo(todoId, userId);
  if (!deleted) {
    throw createError('영구 삭제 조건을 만족하는 할일이 없습니다', 404, 'TODO_PERMANENT_NOT_ALLOWED');
  }
  return deleted;
}

function __setRepository(mockRepository) {
  todoRepository = mockRepository || require('../repositories/todoRepository');
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  completeTodo,
  deleteTodo,
  restoreTodo,
  permanentlyDeleteTodo,
  __setRepository,
};
