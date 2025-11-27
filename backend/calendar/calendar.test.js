const express = require('express');
const http = require('http');
const buildCalendarRouter = require('.');

async function performRequest(server, options) {
  const { port } = server.address();
  const requestOptions = {
    hostname: '127.0.0.1',
    port,
    path: options.path,
    method: options.method,
    headers: options.headers || {},
  };

  return new Promise((resolve, reject) => {
    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const mockService = {
    getHolidays: async () => [
      { date: '2025-01-01', holiday_name: '새해', description: null },
      { date: '2025-02-10', holiday_name: '설날', description: null }
    ]
  };

  const router = buildCalendarRouter({ calendarService: mockService });
  const app = express();
  app.use('/api/calendar', router);
  const server = app.listen(0);

  try {
    const res1 = await performRequest(server, { method: 'GET', path: '/api/calendar/holidays?year=2025' });
    if (res1.status !== 200 || !Array.isArray(res1.body)) throw new Error('GET /api/calendar/holidays failed');

    const res2 = await performRequest(server, { method: 'GET', path: '/api/calendar/holidays?year=2025&month=1' });
    if (res2.status !== 200 || !Array.isArray(res2.body)) throw new Error('GET with month failed');

    console.log('✅ calendar routes tests passed');
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

run();
