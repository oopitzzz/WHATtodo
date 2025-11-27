import client from './client';

/**
 * 회원가입
 * @param {Object} userData - { email, password, nickname }
 * @returns {Promise<{user, accessToken, refreshToken}>}
 */
export async function signup({ email, password, nickname }) {
  const response = await client.post('/auth/signup', {
    email,
    password,
    nickname
  });
  return response.data;
}

/**
 * 로그인
 * @param {Object} credentials - { email, password }
 * @returns {Promise<{user, accessToken, refreshToken}>}
 */
export async function login({ email, password }) {
  const response = await client.post('/auth/login', {
    email,
    password
  });
  return response.data;
}

/**
 * 로그아웃
 * 로컬 스토리지에서 토큰 제거
 */
export async function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * 토큰 갱신
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<{accessToken, refreshToken}>}
 */
export async function refresh(refreshToken) {
  const response = await client.post('/auth/refresh', { refreshToken });
  return response.data;
}

/**
 * 사용자 프로필 조회
 * @returns {Promise<{user}>}
 */
export async function getUserProfile() {
  const response = await client.get('/users/me');
  return response.data;
}

/**
 * 사용자 프로필 수정
 * @param {Object} updates - { nickname, profileImageUrl, notificationEnabled }
 * @returns {Promise<{user}>}
 */
export async function updateUserProfile(updates) {
  const response = await client.put('/users/me', updates);
  return response.data;
}
