let calendarRepository = require('../repositories/calendarRepository');

async function getHolidays(year, month) {
  const currentYear = new Date().getFullYear();

  // year/month 기본값
  const queryYear = year ? parseInt(year) : currentYear;
  const queryMonth = month ? parseInt(month) : null;

  if (queryMonth && (queryMonth < 1 || queryMonth > 12)) {
    const error = new Error('월은 1~12 사이여야 합니다');
    error.statusCode = 400;
    error.code = 'INVALID_MONTH';
    throw error;
  }

  if (queryMonth) {
    return await calendarRepository.getHolidaysByYearMonth(queryYear, queryMonth);
  } else {
    return await calendarRepository.getHolidaysByYear(queryYear);
  }
}

function __setRepository(mockRepo) {
  calendarRepository = mockRepo || require('../repositories/calendarRepository');
}

module.exports = {
  getHolidays,
  __setRepository
};
