const { pool } = require('../db');

let activePool = pool;

async function getHolidaysByYearMonth(year, month) {
  const query = `
    SELECT date, holiday_name, description
    FROM calendars
    WHERE year = $1 AND month = $2 AND is_holiday = true
    ORDER BY date ASC
  `;
  const { rows } = await activePool.query(query, [year, month]);
  return rows;
}

async function getHolidaysByYear(year) {
  const query = `
    SELECT date, holiday_name, description
    FROM calendars
    WHERE year = $1 AND is_holiday = true
    ORDER BY date ASC
  `;
  const { rows } = await activePool.query(query, [year]);
  return rows;
}

function __setPool(customPool) {
  activePool = customPool || pool;
}

function __resetPool() {
  activePool = pool;
}

module.exports = {
  getHolidaysByYearMonth,
  getHolidaysByYear,
  __setPool,
  __resetPool
};
