import { useState, useEffect } from 'react';
import useTodoStore from '../../../store/todo.store';

/**
 * 캘린더 뷰 컴포넌트
 * @param {number} initialYear - 초기 연도
 * @param {number} initialMonth - 초기 월 (1-12)
 * @param {Function} onDateClick - 날짜 클릭 핸들러
 */
const CalendarView = ({ initialYear, initialMonth, onDateClick }) => {
  const today = new Date();
  const [year, setYear] = useState(initialYear || today.getFullYear());
  const [month, setMonth] = useState(initialMonth || today.getMonth() + 1);

  // Zustand store에서 todos 데이터 가져오기
  const { todos, fetchTodos } = useTodoStore();

  // 고정 공휴일 목록 (음력 제외)
  const FIXED_HOLIDAYS = {
    '01-01': '신정',
    '03-01': '삼일절',
    '05-05': '어린이날',
    '06-06': '현충일',
    '08-15': '광복절',
    '10-03': '개천절',
    '10-09': '한글날',
    '12-25': '크리스마스',
  };

  // 컴포넌트 마운트 시 할일 데이터 로드
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 월의 첫 날과 마지막 날 계산
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 캘린더 날짜 배열
  const calendarDates = [];
  const currentDate = new Date(startDate);
  while (calendarDates.length < 42) {
    calendarDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 특정 날짜의 휴일 확인
  const getHolidayName = (date) => {
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return FIXED_HOLIDAYS[monthDay] || null;
  };

  // 특정 날짜의 할일 개수
  const getTodoCountForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return todos.filter(t => t.due_date === dateStr && t.status === 'ACTIVE').length;
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  const isToday = (date) => {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
           date.getMonth() === t.getMonth() &&
           date.getDate() === t.getDate();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === month - 1;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          ←
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {year}년 {month}월
          </h2>
        </div>

        <button
          onClick={handleNextMonth}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          →
        </button>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={handleToday}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          오늘
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
          {calendarDates.map((date, idx) => {
            const holiday = getHolidayName(date);
            const todoCount = getTodoCountForDate(date);
            const isCurrent = isCurrentMonth(date);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={idx}
                onClick={() => onDateClick?.(date)}
                className={`
                  aspect-square p-2 rounded-lg text-center cursor-pointer transition-all
                  ${!isCurrent ? 'bg-gray-50 text-gray-300' : 'bg-white'}
                  ${isCurrentDay ? 'bg-blue-50 border-2 border-blue-500' : ''}
                  ${isCurrent && !isCurrentDay ? 'hover:bg-gray-100' : ''}
                  ${holiday ? 'border-l-4 border-red-500' : ''}
                `}
              >
                <div className={`text-sm font-semibold ${holiday && isCurrent ? 'text-red-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>

                {/* 휴일 표시 */}
                {holiday && isCurrent && (
                  <div className="text-xs text-black font-medium truncate">
                    {holiday}
                  </div>
                )}

                {/* 할일 개수 표시 */}
                {todoCount > 0 && isCurrent && (
                  <div className="mt-1 flex justify-center gap-0.5">
                    {[...Array(Math.min(todoCount, 3))].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-blue-500 rounded-full" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      {/* 범례 */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 space-y-1">
        <p>• 파란 점: 해당 날짜의 할일</p>
        <p>• 붉은 테두리: 공휴일</p>
      </div>
    </div>
  );
};

export default CalendarView;
