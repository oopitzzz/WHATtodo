process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const assert = require('assert');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} = require('./jwt');

function runTests() {
  const payload = { userId: 'user-123', role: 'tester' };

  const accessToken = generateAccessToken(payload);
  const accessData = verifyAccessToken(accessToken);
  assert.strictEqual(accessData.userId, payload.userId);
  assert.strictEqual(accessData.role, payload.role);

  const refreshToken = generateRefreshToken(payload);
  const refreshData = verifyRefreshToken(refreshToken);
  assert.strictEqual(refreshData.userId, payload.userId);

  const decoded = decodeToken(accessToken);
  assert(decoded && decoded.exp > decoded.iat, 'decoded token must contain exp greater than iat');

  console.log('JWT util tests passed');
}

runTests();
