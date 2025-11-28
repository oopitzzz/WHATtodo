import { useState, useEffect, useCallback } from 'react';
import TodoList from '../components/domain/todo/TodoList';
import TodoForm from '../components/domain/todo/TodoForm';
import Button from '../components/common/Button';
import useTodoStore from '../store/todo.store';

export default function DashboardPage() {
  const { todos, filter, sortBy, sortDirection, setFilter, setSortBy, setSortDirection, fetchTodos } = useTodoStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  // 페이지 마운트 시 할일 데이터 로드
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 필터에 따른 통계 계산
  const stats = {
    total: todos.length,
    active: todos.filter(t => t.status === 'ACTIVE').length,
    completed: todos.filter(t => t.status === 'COMPLETED').length
  };

  const handleOpenForm = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };

  const handleEditTodo = useCallback((todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
    // 폼 닫힐 때 데이터 새로고침 (할일 생성/수정 후 반영)
    fetchTodos();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">할일을 효율적으로 관리하세요</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenForm}
          className="w-full md:w-auto"
        >
          + 새 할일
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">전체 할일</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">진행 중</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-sm font-medium">완료됨</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 상태 필터 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ACTIVE">진행 중</option>
              <option value="COMPLETED">완료됨</option>
              <option value="all">모두</option>
            </select>
          </div>

          {/* 정렬 기준 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="created_at">생성일</option>
              <option value="due_date">마감일</option>
              <option value="priority">우선순위</option>
              <option value="updated_at">수정일</option>
            </select>
          </div>

          {/* 정렬 방향 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">순서</label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="DESC">최신순</option>
              <option value="ASC">오래된순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 할일 목록 */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <TodoList onEditTodo={handleEditTodo} />
      </div>

      {/* 할일 폼 모달 */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        mode={editingTodo ? 'update' : 'create'}
        editingTodo={editingTodo}
      />
    </div>
  );
}
