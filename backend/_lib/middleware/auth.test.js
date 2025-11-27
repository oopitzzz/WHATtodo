const authMiddleware = require('./auth');

describe('auth middleware', () => {
  afterEach(() => {
    authMiddleware.__setJwtUtil(null);
  });

  const buildRes = () => {
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };
    return res;
  };

  it('should reject missing header', () => {
    const req = { headers: {} };
    const res = buildRes();
    let nextCalled = false;

    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('AUTH_TOKEN_MISSING');
  });

  it('should reject invalid token', () => {
    authMiddleware.__setJwtUtil({
      verifyAccessToken: () => {
        throw new Error('invalid');
      },
    });

    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = buildRes();

    authMiddleware(req, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.error.code).toBe('AUTH_TOKEN_INVALID');
  });

  it('should set req.user when valid token', () => {
    authMiddleware.__setJwtUtil({
      verifyAccessToken: () => ({ userId: 'user-1', email: 'test@example.com' }),
    });
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = buildRes();
    let nextCalled = false;

    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(res.statusCode).toBeNull();
    expect(req.user).toEqual({ userId: 'user-1', email: 'test@example.com' });
  });
});
