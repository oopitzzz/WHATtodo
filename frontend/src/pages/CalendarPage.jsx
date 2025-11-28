import { useEffect } from 'react';
import CalendarView from '../components/domain/calendar/CalendarView';
import useTodoStore from '../store/todo.store';

export default function CalendarPage() {
  // 캘린더 페이지로 이동할 때 할일 데이터 새로고침
  const { fetchTodos } = useTodoStore();

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleDateClick = (date) => {
    console.log('선택된 날짜:', date.toLocaleDateString('ko-KR'));
    // 향후 선택된 날짜의 할일을 표시하는 기능 추가
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">캘린더</h1>
        <p className="text-gray-600">할일을 캘린더로 확인하세요</p>
      </div>

      <CalendarView onDateClick={handleDateClick} />
    </div>
  );
}
