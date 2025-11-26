const userRepository = require('../repositories/userRepository');
const bcryptUtil = require('../utils/bcrypt');
const jwtUtil = require('../utils/jwt');

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function signup({ email, password, nickname }) {
  if (!email || !password || !nickname) {
    throw createError('필수 입력값이 누락되었습니다', 400, 'VALIDATION_REQUIRED');
  }

  if (password.length < 8) {
    throw createError('비밀번호는 8자 이상이어야 합니다', 400, 'VALIDATION_PASSWORD_LENGTH');
  }

  const existing = await userRepository.findUserByEmail(email);
  if (existing) {
    throw createError('이미 사용 중인 이메일입니다', 409, 'AUTH_EMAIL_DUPLICATE');
  }

  const passwordHash = await bcryptUtil.hashPassword(password);
  const user = await userRepository.createUser({ email, passwordHash, nickname });

  const accessToken = jwtUtil.generateAccessToken({ userId: user.user_id, email: user.email });
  const refreshToken = jwtUtil.generateRefreshToken({ userId: user.user_id });

  return {
    user: {
      userId: user.user_id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url,
      notificationEnabled: user.notification_enabled,
    },
    accessToken,
    refreshToken,
  };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw createError('이메일 또는 비밀번호가 필요합니다', 400, 'VALIDATION_REQUIRED');
  }

  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw createError('이메일 또는 비밀번호가 일치하지 않습니다', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  const isValid = await bcryptUtil.comparePassword(password, user.password_hash);
  if (!isValid) {
    throw createError('이메일 또는 비밀번호가 일치하지 않습니다', 401, 'AUTH_INVALID_CREDENTIALS');
  }

  await userRepository.updateLastLogin(user.user_id);

  const accessToken = jwtUtil.generateAccessToken({ userId: user.user_id, email: user.email });
  const refreshToken = jwtUtil.generateRefreshToken({ userId: user.user_id });

  return {
    user: {
      userId: user.user_id,
      email: user.email,
      nickname: user.nickname,
      profileImageUrl: user.profile_image_url,
      notificationEnabled: user.notification_enabled,
    },
    accessToken,
    refreshToken,
  };
}

async function refresh(token) {
  if (!token) {
    throw createError('Refresh Token이 필요합니다', 400, 'AUTH_TOKEN_REQUIRED');
  }

  let payload;
  try {
    payload = jwtUtil.verifyRefreshToken(token);
  } catch (err) {
    throw createError('유효하지 않거나 만료된 토큰입니다', 401, 'AUTH_TOKEN_EXPIRED');
  }

  const user = await userRepository.findUserById(payload.userId);
  if (!user) {
    throw createError('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND');
  }

  const newAccessToken = jwtUtil.generateAccessToken({ userId: user.user_id, email: user.email });
  const newRefreshToken = jwtUtil.generateRefreshToken({ userId: user.user_id });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

module.exports = {
  signup,
  login,
  refresh,
};
