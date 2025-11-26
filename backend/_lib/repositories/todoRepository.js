const { pool } = require('../db');

let activePool = pool;

const SORTABLE_COLUMNS = new Set(['due_date', 'priority', 'created_at', 'updated_at']);

function pushValue(values, value) {
  values.push(value);
  return `$${values.length}`;
}

function buildTodoFilterClause(values, filters = {}) {
  const clauses = ['user_id = $1'];

  const push = (value) => pushValue(values, value);

  if (filters.status) {
    clauses.push(`status = ${push(filters.status)}`);
  }

  if (filters.priority) {
    clauses.push(`priority = ${push(filters.priority)}`);
  }

  if (filters.dueDateFrom) {
    clauses.push(`due_date >= ${push(filters.dueDateFrom)}`);
  }

  if (filters.dueDateTo) {
    clauses.push(`due_date <= ${push(filters.dueDateTo)}`);
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    const p1 = push(pattern);
    const p2 = push(pattern);
    clauses.push(`(title ILIKE ${p1} OR description ILIKE ${p2})`);
  }

  if (!filters.includeDeleted) {
    clauses.push('deleted_at IS NULL');
  }

  return `WHERE ${clauses.join(' AND ')}`;
}

function sanitizeLimit(limit) {
  const value = Number(limit) || 20;
  return Math.min(Math.max(value, 1), 100);
}

function sanitizeOffset(offset) {
  const value = Number(offset) || 0;
  return Math.max(value, 0);
}

async function createTodo({
  userId,
  title,
  description = null,
  priority = 'NORMAL',
  status = 'ACTIVE',
  dueDate = null,
  memo = null,
}) {
  const query = `
    INSERT INTO todos (user_id, title, description, priority, status, due_date, memo)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [userId, title, description, priority, status, dueDate, memo];
  const { rows } = await activePool.query(query, values);
  return rows[0];
}

async function findTodosByUserId(userId, options = {}) {
  const values = [userId];
  const whereClause = buildTodoFilterClause(values, options);

  const sortColumn = SORTABLE_COLUMNS.has(options.sortBy) ? options.sortBy : 'due_date';
  const sortDirection = options.sortDirection === 'desc' ? 'DESC' : 'ASC';
  const limitPlaceholder = pushValue(values, sanitizeLimit(options.limit));
  const offsetPlaceholder = pushValue(values, sanitizeOffset(options.offset));

  const query = `
    SELECT *
    FROM todos
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}, created_at DESC
    LIMIT ${limitPlaceholder}
    OFFSET ${offsetPlaceholder}
  `;

  const { rows } = await activePool.query(query, values);
  return rows;
}

async function findTodoById(todoId, userId) {
  const values = userId ? [todoId, userId] : [todoId];
  const condition = userId ? 'todo_id = $1 AND user_id = $2' : 'todo_id = $1';
  const query = `
    SELECT *
    FROM todos
    WHERE ${condition}
    LIMIT 1
  `;
  const { rows } = await activePool.query(query, values);
  return rows[0] || null;
}

async function updateTodo(todoId, userId, updates = {}) {
  const fieldMap = {
    title: 'title',
    description: 'description',
    priority: 'priority',
    status: 'status',
    dueDate: 'due_date',
    memo: 'memo',
  };

  const setClauses = [];
  const values = [];

  Object.entries(fieldMap).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      const placeholder = pushValue(values, updates[key]);
      setClauses.push(`${column} = ${placeholder}`);
    }
  });

  if (!setClauses.length) {
    return findTodoById(todoId, userId);
  }

  const todoPlaceholder = pushValue(values, todoId);
  const userPlaceholder = pushValue(values, userId);

  const query = `
    UPDATE todos
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = ${todoPlaceholder} AND user_id = ${userPlaceholder}
    RETURNING *
  `;

  const { rows } = await activePool.query(query, values);
  return rows[0] || null;
}

async function completeTodo(todoId, userId) {
  const query = `
    UPDATE todos
    SET status = 'COMPLETED',
        completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2
    RETURNING *
  `;
  const { rows } = await activePool.query(query, [todoId, userId]);
  return rows[0] || null;
}

async function deleteTodo(todoId, userId) {
  const query = `
    UPDATE todos
    SET status = 'DELETED',
        deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2
    RETURNING *
  `;
  const { rows } = await activePool.query(query, [todoId, userId]);
  return rows[0] || null;
}

async function restoreTodo(todoId, userId, status = 'ACTIVE') {
  const query = `
    UPDATE todos
    SET status = $3,
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE todo_id = $1 AND user_id = $2
    RETURNING *
  `;
  const { rows } = await activePool.query(query, [todoId, userId, status]);
  return rows[0] || null;
}

async function permanentlyDeleteTodo(todoId, userId) {
  const query = `
    DELETE FROM todos
    WHERE todo_id = $1
      AND user_id = $2
      AND deleted_at IS NOT NULL
      AND deleted_at <= NOW() - INTERVAL '30 days'
    RETURNING todo_id
  `;
  const { rows } = await activePool.query(query, [todoId, userId]);
  return rows.length > 0;
}

function __setPool(customPool) {
  activePool = customPool || pool;
}

function __resetPool() {
  activePool = pool;
}

module.exports = {
  createTodo,
  findTodosByUserId,
  findTodoById,
  updateTodo,
  completeTodo,
  deleteTodo,
  restoreTodo,
  permanentlyDeleteTodo,
  __setPool,
  __resetPool,
};
