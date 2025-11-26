let jwtUtil = require('../utils/jwt');

function setJwtUtil(mock) {
  jwtUtil = mock || require('../utils/jwt');
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: '인증 토큰이 필요합니다',
      },
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_MISSING',
        message: '인증 토큰이 필요합니다',
      },
    });
  }

  try {
    const payload = jwtUtil.verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: '유효하지 않거나 만료된 토큰입니다',
      },
    });
  }
}

module.exports = authMiddleware;
module.exports.__setJwtUtil = setJwtUtil;
