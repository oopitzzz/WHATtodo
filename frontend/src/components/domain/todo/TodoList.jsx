import { useEffect, useCallback } from 'react';
import TodoItem from './TodoItem';
import LoadingSpinner from '../../common/LoadingSpinner';
import useTodoStore from '../../../store/todo.store';

/**
 * 할일 목록 컴포넌트
 * @param {Function} onEditTodo - 할일 수정 클릭 핸들러
 * @param {boolean} showEmpty - 빈 상태 메시지 표시 여부
 */
const TodoList = ({ onEditTodo, showEmpty = true }) => {
  const { todos, isLoading, error, fetchTodos, clearError } = useTodoStore();

  // 초기 데이터 로드
  useEffect(() => {
    fetchTodos();
  }, []);

  const handleRetry = useCallback(() => {
    clearError();
    fetchTodos();
  }, [fetchTodos, clearError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="md" text="할일을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium mb-4">할일을 불러올 수 없습니다</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (todos.length === 0 && showEmpty) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg font-medium">할일이 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">새로운 할일을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.todo_id}
          todo={todo}
          onEdit={onEditTodo}
        />
      ))}
    </div>
  );
};

export default TodoList;
