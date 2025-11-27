import client from './client';

/**
 * 할일 목록 조회
 * @param {Object} filters - { status, sortBy, sortDirection, limit, offset, search, includeDeleted }
 * @returns {Promise<{data: Todo[]}>}
 */
export async function getTodos(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.search) params.append('search', filters.search);
  if (filters.includeDeleted) params.append('includeDeleted', filters.includeDeleted);

  const queryString = params.toString();
  const url = queryString ? `/todos?${queryString}` : '/todos';

  const response = await client.get(url);
  return response.data;
}

/**
 * 할일 생성
 * @param {Object} todoData - { title, description, priority, dueDate, memo }
 * @returns {Promise<{data: Todo}>}
 */
export async function createTodo(todoData) {
  const response = await client.post('/todos', todoData);
  return response.data;
}

/**
 * 할일 상세 조회
 * @param {string} id - Todo ID
 * @returns {Promise<{data: Todo}>}
 */
export async function getTodoById(id) {
  const response = await client.get(`/todos/${id}`);
  return response.data;
}

/**
 * 할일 수정
 * @param {string} id - Todo ID
 * @param {Object} updates - { title, description, priority, dueDate, memo, status }
 * @returns {Promise<{data: Todo}>}
 */
export async function updateTodo(id, updates) {
  const response = await client.put(`/todos/${id}`, updates);
  return response.data;
}

/**
 * 할일 완료 처리
 * @param {string} id - Todo ID
 * @returns {Promise<{data: Todo}>}
 */
export async function completeTodo(id) {
  const response = await client.patch(`/todos/${id}/complete`);
  return response.data;
}

/**
 * 할일 복원
 * @param {string} id - Todo ID
 * @param {string} status - 복원할 상태 (기본값: ACTIVE)
 * @returns {Promise<{data: Todo}>}
 */
export async function restoreTodo(id, status = 'ACTIVE') {
  const response = await client.patch(`/todos/${id}/restore`, { status });
  return response.data;
}

/**
 * 할일 삭제
 * @param {string} id - Todo ID
 * @returns {Promise<{data: Todo}>}
 */
export async function deleteTodo(id) {
  const response = await client.delete(`/todos/${id}`);
  return response.data;
}

/**
 * 휴일 조회
 * @param {Object} params - { year, month }
 * @returns {Promise<{data: Holiday[]}>}
 */
export async function getHolidays({ year, month }) {
  const response = await client.get('/calendar/holidays', {
    params: { year, month }
  });
  return response.data;
}

/**
 * 휴지통 목록 조회
 * @param {Object} params - { page, pageSize }
 * @returns {Promise<{data: {items: Todo[], meta: {page, pageSize, total, totalPages}}}}>}
 */
export async function getTrash(params = { page: 1, pageSize: 20 }) {
  const response = await client.get('/trash', { params });
  return response.data;
}

/**
 * 휴지통 아이템 영구 삭제
 * @param {string} id - Todo ID
 * @returns {Promise<void>}
 */
export async function permanentlyDeleteTodo(id) {
  const response = await client.delete(`/trash/${id}`);
  return response.data;
}
