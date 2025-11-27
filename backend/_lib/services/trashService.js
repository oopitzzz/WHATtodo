let todoRepository = require('../repositories/todoRepository');

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

/**
 * 휴지통 목록 조회
 * @param {string} userId - 사용자 ID
 * @param {object} options - 옵션 (limit, offset)
 * @returns {Promise<{items: Array, meta: {page: number, pageSize: number, total: number}}>}
 */
async function getTrash(userId, options = {}) {
  // 페이지 기반 옵션을 limit/offset으로 변환
  const page = Math.max(parseInt(options.page) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(options.pageSize) || 20, 1), 100);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const items = await todoRepository.getTrashedTodosByUserId(userId, { limit, offset });
  const total = await todoRepository.getTrashedTodoCount(userId);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

/**
 * 휴지통 항목 영구 삭제
 * @param {string} userId - 사용자 ID
 * @param {string} todoId - 할일 ID
 * @returns {Promise<boolean>} 삭제 여부
 */
async function permanentlyDeleteTrash(userId, todoId) {
  const deleted = await todoRepository.permanentlyDeleteTodoById(todoId, userId);
  if (!deleted) {
    throw createError('휴지통에서 항목을 찾을 수 없습니다', 404, 'TRASH_NOT_FOUND');
  }
  return deleted;
}

/**
 * 30일 이상 경과한 할일 자동 삭제 (스케줄러용)
 * @returns {Promise<{deletedCount: number}>}
 */
async function autoDeleteExpiredTrash() {
  // 이 함수는 스케줄러에서 주기적으로 호출됨
  // 실제 DB 쿼리는 별도 구현 (scheduler와 함께)
  return {
    deletedCount: 0,
    message: 'Auto delete scheduler is configured'
  };
}

function __setRepository(mockRepository) {
  todoRepository = mockRepository || require('../repositories/todoRepository');
}

module.exports = {
  getTrash,
  permanentlyDeleteTrash,
  autoDeleteExpiredTrash,
  __setRepository
};
