const assert = require('assert');
const authMiddleware = require('./auth');

function createRes() {
  return {
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
}

async function testMissingHeader() {
  const req = { headers: {} };
  const res = createRes();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error.code, 'AUTH_TOKEN_MISSING');
}

async function testInvalidToken() {
  authMiddleware.__setJwtUtil({
    verifyAccessToken: () => {
      throw new Error('invalid');
    },
  });

  const req = { headers: { authorization: 'Bearer invalid' } };
  const res = createRes();

  authMiddleware(req, res, () => {});

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error.code, 'AUTH_TOKEN_INVALID');
}

async function testValidToken() {
  let nextCalled = false;
  authMiddleware.__setJwtUtil({
    verifyAccessToken: () => ({ userId: 'user-1', email: 'test@example.com' }),
  });

  const req = { headers: { authorization: 'Bearer validtoken' } };
  const res = createRes();

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(res.statusCode, null);
  assert.strictEqual(nextCalled, true);
  assert.deepStrictEqual(req.user, { userId: 'user-1', email: 'test@example.com' });
}

async function run() {
  try {
    await testMissingHeader();
    await testInvalidToken();
    await testValidToken();
    console.log('auth middleware tests passed');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    authMiddleware.__setJwtUtil(null);
  }
}

run();
