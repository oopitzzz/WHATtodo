let userRepository = require('../repositories/userRepository');

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function getProfile(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw createError('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND');
  }
  return user;
}

async function updateProfile(userId, updates = {}) {
  const updated = await userRepository.updateUser(userId, updates);
  if (!updated) {
    throw createError('프로필 업데이트에 실패했습니다', 500, 'UPDATE_FAILED');
  }
  return updated;
}

function __setRepository(mockRepo) {
  userRepository = mockRepo || require('../repositories/userRepository');
}

module.exports = {
  getProfile,
  updateProfile,
  __setRepository
};
