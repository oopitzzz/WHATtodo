const express = require('express');
const request = require('supertest');
const buildCalendarRouter = require('.');

describe('calendar routes', () => {
  let app;
  let mockService;

  beforeEach(() => {
    mockService = {
      getHolidays: jest.fn().mockResolvedValue([
        { date: '2025-01-01', holiday_name: '신정' },
        { date: '2025-02-10', holiday_name: '설날' },
      ]),
    };

    const router = buildCalendarRouter({ calendarService: mockService });
    app = express();
    app.use('/api/calendar', router);
  });

  it('should return holidays', async () => {
    const res = await request(app).get('/api/calendar/holidays?year=2025');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockService.getHolidays).toHaveBeenCalledWith('2025', undefined);
  });

  it('should handle month filter', async () => {
    await request(app).get('/api/calendar/holidays?year=2025&month=1');
    expect(mockService.getHolidays).toHaveBeenCalledWith('2025', '1');
  });
});
