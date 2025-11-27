const express = require('express');
const defaultAuthMiddleware = require('../_lib/middleware/auth');
const defaultUserService = require('../_lib/services/userService');

function buildUsersRouter({ authMiddleware = defaultAuthMiddleware, userService = defaultUserService } = {}) {
  const router = express.Router();
  router.use(authMiddleware);

  // GET /api/users/me - 프로필 조회
  router.get('/me', async (req, res, next) => {
    try {
      const user = await userService.getProfile(req.user.userId);
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/users/me - 프로필 수정
  router.put('/me', async (req, res, next) => {
    try {
      const updated = await userService.updateProfile(req.user.userId, req.body || {});
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildUsersRouter;
module.exports.default = buildUsersRouter();
