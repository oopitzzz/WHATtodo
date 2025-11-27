jest.mock('../_lib/middleware/cors', () => (req, res, next) => next());

jest.mock('../_lib/services/authService', () => ({
  signup: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
}));

const authService = require('../_lib/services/authService');
const signupHandler = require('./signup');
const loginHandler = require('./login');
const refreshHandler = require('./refresh');
const logoutHandler = require('./logout');

describe('Auth handlers', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { method: 'POST', body: {}, headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('signup', () => {
    it('returns 400 on missing fields', async () => {
      req.body = { email: 'test@example.com' };
      await signupHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'VALIDATION_REQUIRED_FIELDS', message: '필수 입력값이 누락되었습니다' },
      });
    });

    it('calls authService.signup on valid input', async () => {
      authService.signup.mockResolvedValue({
        user: { userId: 'user-123', email: 'test@example.com', nickname: 'testuser', notificationEnabled: true },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      req.body = { email: 'test@example.com', password: 'password123', nickname: 'testuser' };

      await signupHandler(req, res);

      expect(authService.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        nickname: 'testuser',
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('returns 400 when email or password missing', async () => {
      req.body = { email: 'test@example.com' };
      await loginHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'VALIDATION_REQUIRED_FIELDS', message: '이메일과 비밀번호를 입력해주세요' },
      });
    });

    it('calls authService.login on valid credentials', async () => {
      authService.login.mockResolvedValue({
        user: { userId: 'user-123', email: 'test@example.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      req.body = { email: 'test@example.com', password: 'password123' };

      await loginHandler(req, res);

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('refresh', () => {
    it('returns 400 when refreshToken missing', async () => {
      req.body = {};
      await refreshHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: { code: 'VALIDATION_REQUIRED_FIELDS', message: 'Refresh token이 필요합니다' },
      });
    });

    it('calls authService.refresh on valid token', async () => {
      authService.refresh.mockResolvedValue({ accessToken: 'new-access-token' });
      req.body = { refreshToken: 'valid-refresh-token' };

      await refreshHandler(req, res);

      expect(authService.refresh).toHaveBeenCalledWith('valid-refresh-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('logout', () => {
    it('returns 200 on POST', async () => {
      await logoutHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: '로그아웃 되었습니다' });
    });

    it('returns 405 on non-POST', async () => {
      req.method = 'GET';
      await logoutHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(405);
    });
  });
});
