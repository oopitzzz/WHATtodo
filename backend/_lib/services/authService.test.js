const authService = require('./authService');
const userRepository = require('../repositories/userRepository');
const bcryptUtil = require('../utils/bcrypt');
const jwtUtil = require('../utils/jwt');

jest.mock('../repositories/userRepository', () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  findUserById: jest.fn(),
  updateLastLogin: jest.fn(),
}));

jest.mock('../utils/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../utils/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create user and return tokens', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      bcryptUtil.hashPassword.mockResolvedValue('hashed');
      userRepository.createUser.mockResolvedValue({
        user_id: 'user-1',
        email: 'test@example.com',
        nickname: 'tester',
        profile_image_url: null,
        notification_enabled: true,
      });
      jwtUtil.generateAccessToken.mockReturnValue('access');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh');

      const result = await authService.signup({
        email: 'test@example.com',
        password: 'Password123!',
        nickname: 'tester',
      });

      expect(userRepository.createUser).toHaveBeenCalledTimes(1);
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('access');
      expect(result.refreshToken).toBe('refresh');
    });

    it('should throw when email duplicated', async () => {
      userRepository.findUserByEmail.mockResolvedValue({ user_id: 'user-1' });

      await expect(
        authService.signup({
          email: 'dup@example.com',
          password: 'Password123!',
          nickname: 'tester',
        })
      ).rejects.toMatchObject({ code: 'AUTH_EMAIL_DUPLICATE', statusCode: 409 });
    });

    it('should throw when password too short', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      await expect(
        authService.signup({
          email: 'test@example.com',
          password: 'short',
          nickname: 'tester',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_PASSWORD_LENGTH', statusCode: 400 });
    });
  });

  describe('login', () => {
    it('should login and return tokens', async () => {
      userRepository.findUserByEmail.mockResolvedValue({
        user_id: 'user-1',
        email: 'test@example.com',
        password_hash: 'hashed',
        nickname: 'tester',
        profile_image_url: null,
        notification_enabled: true,
      });
      bcryptUtil.comparePassword.mockResolvedValue(true);
      jwtUtil.generateAccessToken.mockReturnValue('access');
      jwtUtil.generateRefreshToken.mockReturnValue('refresh');

      const result = await authService.login({ email: 'test@example.com', password: 'Password123!' });
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith('user-1');
      expect(result.accessToken).toBe('access');
      expect(result.refreshToken).toBe('refresh');
    });

    it('should throw for invalid credentials', async () => {
      userRepository.findUserByEmail.mockResolvedValue({
        user_id: 'user-1',
        email: 'test@example.com',
        password_hash: 'hashed',
      });
      bcryptUtil.comparePassword.mockResolvedValue(false);

      await expect(authService.login({ email: 'test@example.com', password: 'wrong' })).rejects.toMatchObject({
        code: 'AUTH_INVALID_CREDENTIALS',
        statusCode: 401,
      });
    });
  });

  describe('refresh', () => {
    it('should issue new tokens when refresh token valid', async () => {
      jwtUtil.verifyRefreshToken.mockReturnValue({ userId: 'user-1' });
      userRepository.findUserById.mockResolvedValue({ user_id: 'user-1', email: 'test@example.com' });
      jwtUtil.generateAccessToken.mockReturnValue('new-access');
      jwtUtil.generateRefreshToken.mockReturnValue('new-refresh');

      const result = await authService.refresh('valid');
      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
    });

    it('should throw when refresh token invalid', async () => {
      jwtUtil.verifyRefreshToken.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(authService.refresh('bad')).rejects.toMatchObject({
        code: 'AUTH_TOKEN_EXPIRED',
        statusCode: 401,
      });
    });
  });
});
