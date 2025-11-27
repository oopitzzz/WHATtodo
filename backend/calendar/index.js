const express = require('express');
const defaultCalendarService = require('../_lib/services/calendarService');

function buildCalendarRouter({ calendarService = defaultCalendarService } = {}) {
  const router = express.Router();

  // GET /api/calendar/holidays - 공휴일 조회 (year, month 쿼리)
  router.get('/holidays', async (req, res, next) => {
    try {
      const holidays = await calendarService.getHolidays(req.query.year, req.query.month);
      res.json(holidays);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = buildCalendarRouter;
module.exports.default = buildCalendarRouter();
