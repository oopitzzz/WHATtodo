process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} = require('./jwt');

describe('jwt utils', () => {
  it('should generate and verify access/refresh tokens', () => {
    const payload = { userId: 'user-123', role: 'tester' };

    const accessToken = generateAccessToken(payload);
    const accessData = verifyAccessToken(accessToken);
    expect(accessData.userId).toBe(payload.userId);
    expect(accessData.role).toBe(payload.role);

    const refreshToken = generateRefreshToken(payload);
    const refreshData = verifyRefreshToken(refreshToken);
    expect(refreshData.userId).toBe(payload.userId);

    const decoded = decodeToken(accessToken);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });
});
