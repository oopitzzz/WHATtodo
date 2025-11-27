import { useState, useCallback } from 'react';
import { memo } from 'react';
import Button from '../../common/Button';
import useTodoStore from '../../../store/todo.store';

/**
 * 할일 아이템 컴포넌트
 * @param {Object} todo - 할일 데이터 (snake_case)
 * @param {string} todo.todo_id - 할일 ID
 * @param {string} todo.title - 제목
 * @param {string} todo.description - 설명
 * @param {string} todo.priority - 우선순위 (HIGH, NORMAL, LOW)
 * @param {string} todo.status - 상태 (ACTIVE, COMPLETED)
 * @param {string} todo.due_date - 마감일
 * @param {string} todo.memo - 메모
 * @param {Function} onEdit - 수정 버튼 클릭 핸들러
 */
const TodoItem = ({ todo, onEdit }) => {
  const { completeTodo, deleteTodo } = useTodoStore();
  const [isLoading, setIsLoading] = useState(false);

  const priorityColors = {
    HIGH: 'bg-red-100 text-red-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    LOW: 'bg-gray-100 text-gray-800'
  };

  const priorityLabels = {
    HIGH: '높음',
    NORMAL: '중간',
    LOW: '낮음'
  };

  const isCompleted = todo.status === 'COMPLETED';

  // D-day 계산
  const calculateDday = (dueDate) => {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    if (diffDays === 0) return 'D-day';
    if (diffDays > 0) return `D-${diffDays}`;
  };

  const dday = todo.due_date ? calculateDday(todo.due_date) : null;

  const handleComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      await completeTodo(todo.todo_id);
    } catch (error) {
      console.error('할일 완료 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [todo.todo_id, completeTodo]);

  const handleDelete = useCallback(async () => {
    if (window.confirm('이 할일을 삭제하시겠습니까?')) {
      setIsLoading(true);
      try {
        await deleteTodo(todo.todo_id);
      } catch (error) {
        console.error('할일 삭제 실패:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [todo.todo_id, deleteTodo]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 transition-all ${
      isCompleted ? 'opacity-70 bg-gray-50' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleComplete}
          disabled={isLoading}
          className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
        />

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className={`font-semibold text-gray-900 flex-1 ${
              isCompleted ? 'line-through text-gray-500' : ''
            }`}>
              {todo.title}
            </h3>
            {todo.priority && (
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                priorityColors[todo.priority] || priorityColors.NORMAL
              }`}>
                {priorityLabels[todo.priority]}
              </span>
            )}
          </div>

          {todo.description && (
            <p className={`text-sm mb-2 ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
            } truncate`}>
              {todo.description}
            </p>
          )}

          {todo.memo && (
            <p className={`text-xs mb-2 ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-500'
            } truncate`}>
              메모: {todo.memo}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            {dday && (
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                dday.includes('+') ? 'bg-red-100 text-red-700' :
                dday === 'D-day' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {dday}
              </span>
            )}
            {todo.due_date && (
              <span className={`text-xs ${
                isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {new Date(todo.due_date).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(todo)}
            disabled={isLoading}
          >
            수정
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(TodoItem);
