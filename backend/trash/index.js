const express = require('express');
const defaultAuthMiddleware = require('../_lib/middleware/auth');
const defaultTrashService = require('../_lib/services/trashService');

function buildTrashRouter({ authMiddleware = defaultAuthMiddleware, trashService = defaultTrashService } = {}) {
  const router = express.Router();

  router.use(authMiddleware);

  // GET /api/trash - 휴지통 조회
  router.get('/', async (req, res, next) => {
    try {
      const options = {
        page: req.query.page,
        pageSize: req.query.pageSize
      };
      const result = await trashService.getTrash(req.user.userId, options);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /api/trash/:id - 영구 삭제
  router.delete('/:id', async (req, res, next) => {
    try {
      await trashService.permanentlyDeleteTrash(req.user.userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildTrashRouter;
module.exports.default = buildTrashRouter();
