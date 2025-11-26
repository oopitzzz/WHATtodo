const assert = require('assert');
const authService = require('./authService');
const userRepository = require('../repositories/userRepository');
const bcryptUtil = require('../utils/bcrypt');
const jwtUtil = require('../utils/jwt');

const originals = {
  findUserByEmail: userRepository.findUserByEmail,
  createUser: userRepository.createUser,
  findUserById: userRepository.findUserById,
  updateLastLogin: userRepository.updateLastLogin,
  hashPassword: bcryptUtil.hashPassword,
  comparePassword: bcryptUtil.comparePassword,
  generateAccessToken: jwtUtil.generateAccessToken,
  generateRefreshToken: jwtUtil.generateRefreshToken,
  verifyRefreshToken: jwtUtil.verifyRefreshToken,
};

function mockFunctions(overrides = {}) {
  Object.entries(overrides).forEach(([key, value]) => {
    if (key in userRepository) userRepository[key] = value;
    if (key in bcryptUtil) bcryptUtil[key] = value;
    if (key in jwtUtil) jwtUtil[key] = value;
  });
}

function restoreMocks() {
  Object.entries(originals).forEach(([key, value]) => {
    if (key in userRepository) userRepository[key] = value;
    if (key in bcryptUtil) bcryptUtil[key] = value;
    if (key in jwtUtil) jwtUtil[key] = value;
  });
}

async function testSignupSuccess() {
  mockFunctions({
    findUserByEmail: async () => null,
    hashPassword: async () => 'hashed',
    createUser: async () => ({
      user_id: 'user-1',
      email: 'test@example.com',
      nickname: 'tester',
      profile_image_url: null,
      notification_enabled: true,
    }),
    generateAccessToken: () => 'access-token',
    generateRefreshToken: () => 'refresh-token',
  });

  const result = await authService.signup({
    email: 'test@example.com',
    password: 'Password123!',
    nickname: 'tester',
  });

  assert.strictEqual(result.user.email, 'test@example.com');
  assert.strictEqual(result.accessToken, 'access-token');
  assert.strictEqual(result.refreshToken, 'refresh-token');
}

async function testSignupDuplicateEmail() {
  mockFunctions({
    findUserByEmail: async () => ({ user_id: 'user-1' }),
  });

  let caught = null;
  try {
    await authService.signup({
      email: 'dup@example.com',
      password: 'Password123!',
      nickname: 'tester',
    });
  } catch (error) {
    caught = error;
  }
  assert(caught, 'should throw duplicate email');
  assert.strictEqual(caught.code, 'AUTH_EMAIL_DUPLICATE');
}

async function testLoginInvalidPassword() {
  mockFunctions({
    findUserByEmail: async () => ({
      user_id: 'user-1',
      email: 'test@example.com',
      password_hash: 'hashed',
    }),
    comparePassword: async () => false,
  });

  let caught = null;
  try {
    await authService.login({ email: 'test@example.com', password: 'wrong' });
  } catch (error) {
    caught = error;
  }
  assert(caught, 'should throw invalid credentials');
  assert.strictEqual(caught.code, 'AUTH_INVALID_CREDENTIALS');
}

async function testRefreshTokenFlow() {
  mockFunctions({
    verifyRefreshToken: () => ({ userId: 'user-1' }),
    findUserById: async () => ({
      user_id: 'user-1',
      email: 'test@example.com',
    }),
    generateAccessToken: () => 'new-access',
    generateRefreshToken: () => 'new-refresh',
  });

  const result = await authService.refresh('valid-refresh');
  assert.strictEqual(result.accessToken, 'new-access');
  assert.strictEqual(result.refreshToken, 'new-refresh');
}

async function run() {
  try {
    await testSignupSuccess();
    await testSignupDuplicateEmail();
    await testLoginInvalidPassword();
    await testRefreshTokenFlow();
    console.log('auth service tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    restoreMocks();
  }
}

run();
