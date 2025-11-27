const express = require('express');
const defaultAuthMiddleware = require('../_lib/middleware/auth');
const defaultTodoService = require('../_lib/services/todoService');

function buildTodoRouter({ authMiddleware = defaultAuthMiddleware, todoService = defaultTodoService } = {}) {
  const router = express.Router();

  router.use(authMiddleware);

  router.get('/', async (req, res, next) => {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortDirection: req.query.sortDirection,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        includeDeleted: req.query.includeDeleted === 'true',
      };
      const todos = await todoService.getTodos(req.user.userId, filters);
      res.json({ data: todos });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const created = await todoService.createTodo(req.user.userId, req.body || {});
      res.status(201).json({ data: created });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const todo = await todoService.getTodoById(req.user.userId, req.params.id);
      res.json({ data: todo });
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await todoService.updateTodo(req.user.userId, req.params.id, req.body || {});
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/complete', async (req, res, next) => {
    try {
      const completed = await todoService.completeTodo(req.user.userId, req.params.id);
      res.json({ data: completed });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/restore', async (req, res, next) => {
    try {
      const restored = await todoService.restoreTodo(
        req.user.userId,
        req.params.id,
        req.body?.status || 'ACTIVE'
      );
      res.json({ data: restored });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const deleted = await todoService.deleteTodo(req.user.userId, req.params.id);
      res.json({ data: deleted });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildTodoRouter;
module.exports.default = buildTodoRouter();
